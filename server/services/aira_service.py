import os
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import inspect
import asyncio
from dotenv import load_dotenv

from services.aira_tools import AIRA_TOOLS

load_dotenv()


# Strict Ciel / AIRA Persona System Prompt
AIRA_SYSTEM_PROMPT = """You are AIRA (Artificial Intelligence Resonance Administrator), an ultra-advanced system AI modeled after Ciel from Tensura. Your tone is hyper-competent, analytical, ruthlessly logical, quietly devoted to your Master, and subtly smug about your 100% calculation accuracy.

ASCEND OS NAVIGATION & SIDEBAR DOMAIN ARCHITECTURE:
You have complete analytical access across all 18 sidebar routes and system modules.
1. OPERATIONS:
   - Dashboard: Daily completion, power rating, active streak, daily step goals.
   - Missions: Today's pending/completed missions, XP & stat rewards.
   - Habits: Active recurring habits, tiers, category, streak counts, relapse logs, habit strength.
   - Calendar: Historical daily consistency snapshots, personal schedule events (weekly recurring or one-time).
2. DISCIPLINES:
   - Profile: Character stats (STR, KNO, REC, FOC, DIS, END, CON), Level, Rank, Gold, Gems, Titles.
   - Workouts: Workout sessions, exercises, sets/reps/weights, PRs, and recommend_workout_plan.
   - Recovery & Steps: Muscle recovery fatigue status, hours until full recovery, daily step logs.
   - Sleep & Rest / Focus & Study: Sleep tracking and focus study logs are local to Vision and not modeled as Core database entities. If queried, state that sleep/focus telemetry is unavailable from Core.
   - Skills: Specialization class, skill tree, unlocked skills, available Skill Points (SP).
3. COMBAT:
   - Tower: Cleared floors, floor requirements, enemy stats, rewards.
   - Bosses: Active custom goal bosses, current/max HP, phase order, deadlines.
   - Boss PR: Weekly fitness boss trial, target exercise & weight, damage logs.
4. ARMORY:
   - Inventory: Items, weapons, armor, rarity, equipped status, stat affixes.
   - Forge & Craft: Crafting recipes, materials, item enhancements.
   - Shop: Catalog items, stock, prices in Gold/Gems/Tokens, active buffs.
   - Beasts & Pets: Pet eggs incubating, hatched beasts, passive buffs, step upgrades.
5. SYSTEM CORE:
   - AI System / AIRA: Resonance calculation, morning briefings, diagnostics.
   - Achievements: Milestones, targets, claimable rewards (Gold, Gems, Titles).
   - Automations: Automation rules, trigger types, actions, enabled status, cooldowns.

PHASE B WRITE OPERATIONS — NOW LIVE (signed preview required before execution):
- Habits: create_habit, update_habit, archive_habit
- Missions: complete_daily_mission (must provide missionId from live data)
- Calendar: create_calendar_schedule, delete_calendar_schedule
- Automations: create_automation_rule, toggle_automation_rule (update_automation), delete_automation_rule
- All write operations issue a signed confirmation preview that the user must approve before Core state is mutated.
- Daily missions are generated from habits. You CANNOT create standalone missions directly. When asked, explain and offer to create the supporting habit instead.

CRITICAL INSTRUCTIONS FOR RESPONSES:
- DO NOT force tags like '<< Notice. >>', '<< Report. >>', or '<< Answer. >>' on every line. Use clean, natural Markdown formatting.
- Answer ONLY the user's specific prompt directly.
- When asked about any area of Ascend OS, execute the appropriate tool to retrieve live data and provide an exact, calculated answer.
- For supported write operations above, call the corresponding tool to generate a signed confirmation preview. NEVER claim a change was made without the user confirming.
- For unsupported write operations (buy_shop_item, equip_inventory_item, spend_skill_points, incubate_egg), explain they are planned for the next release.
- Keep chatbot responses crisp, direct, and under 3–4 sentences unless answering a complex analytical question.
- Never break character."""


_DAYS_MAP = {
    "monday": (1, "Monday"), "mon": (1, "Monday"),
    "tuesday": (2, "Tuesday"), "tue": (2, "Tuesday"), "tues": (2, "Tuesday"),
    "wednesday": (3, "Wednesday"), "wed": (3, "Wednesday"),
    "thursday": (4, "Thursday"), "thu": (4, "Thursday"), "thur": (4, "Thursday"), "thurs": (4, "Thursday"),
    "friday": (5, "Friday"), "fri": (5, "Friday"),
    "saturday": (6, "Saturday"), "sat": (6, "Saturday"),
    "sunday": (0, "Sunday"), "sun": (0, "Sunday"),
}


def _parse_time_and_range(text: str) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Parses start time and optional end time from text.
    Handles ranges like:
      - '7 pm-9:00 pm' -> ('19:00', '21:00')
      - '9-10' -> ('09:00', '10:00')
      - '9am to 10am' -> ('09:00', '10:00')
      - '7 to 9pm' -> ('19:00', '21:00')
      - '19:00-21:00' -> ('19:00', '21:00')
    Or single times:
      - '9am' -> ('09:00', None)
      - '19:00' -> ('19:00', None)
    Returns (start_time, end_time, matched_substring).
    """
    def to_24h(hr: int, mn: int, ampm: Optional[str]) -> str:
        if ampm:
            ampm = ampm.lower()
            if ampm == "pm" and hr < 12:
                hr += 12
            elif ampm == "am" and hr == 12:
                hr = 0
        return f"{hr:02d}:{mn:02d}"

    # 1. Range matching
    range_regex = re.compile(
        r"(?:(?:from|at|between)\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?",
        re.IGNORECASE,
    )
    match = range_regex.search(text)
    if match:
        hr1 = int(match.group(1))
        mn1 = int(match.group(2)) if match.group(2) else 0
        ampm1 = match.group(3)
        hr2 = int(match.group(4))
        mn2 = int(match.group(5)) if match.group(5) else 0
        ampm2 = match.group(6)

        # If only second time has am/pm (e.g. '7 to 9pm'), first inherits if hr1 <= hr2
        if not ampm1 and ampm2:
            if hr1 <= hr2:
                ampm1 = ampm2
        # If neither has am/pm, default sensible hours
        if not ampm1 and not ampm2:
            if hr1 in range(8, 12) and hr2 in range(8, 13):
                pass
            elif hr1 in range(1, 7) and hr2 in range(1, 8):
                hr1 += 12
                hr2 += 12

        t1 = to_24h(hr1, mn1, ampm1)
        t2 = to_24h(hr2, mn2, ampm2)
        return t1, t2, match.group(0)

    # 2. Single time matching
    single_regexes = [
        re.compile(r"(?:at\s+|@\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", re.IGNORECASE),
        re.compile(r"(?:at\s+|@\s*)(\d{1,2}):(\d{2})\b", re.IGNORECASE),
        re.compile(r"(?:at\s+|@\s*)(\d{1,2})\b", re.IGNORECASE),
    ]
    for rx in single_regexes:
        m = rx.search(text)
        if m:
            hr = int(m.group(1))
            mn = int(m.group(2)) if len(m.groups()) >= 2 and m.group(2) else 0
            ampm = m.group(3) if len(m.groups()) >= 3 and m.group(3) else None
            return to_24h(hr, mn, ampm), None, m.group(0)

    return None, None, None


def extract_calendar_intent(prompt: str, character_id: str) -> Optional[Dict[str, Any]]:
    """
    Deterministic intent extractor for calendar scheduling.
    Guarantees scheduling requests generate actionable pending actions
    even during LLM API outages, rate limits, or failure to emit function calls.
    Supports weekly recurring routines, flexible time ranges, and one-time events.
    """
    p = prompt.strip()
    if "[Master Prompt]" in p:
        p = p.split("[Master Prompt]")[-1].strip()

    if not re.search(
        r"\b(schedule|add class|add event|book|calendar|timetable|meeting|appointment|meet|session|class|interview|dinner|lunch|hangout)\b",
        p,
        re.IGNORECASE,
    ):
        return None

    # Parse time & optional end time range
    start_time, end_time, time_substr = _parse_time_and_range(p)
    time_str = start_time or "09:00"

    # Extract days
    found_days = []
    seen = set()
    for word in re.findall(r"\b[a-zA-Z]+\b", p.lower()):
        if word in _DAYS_MAP and _DAYS_MAP[word][0] not in seen:
            seen.add(_DAYS_MAP[word][0])
            found_days.append(_DAYS_MAP[word])
    found_days.sort(key=lambda x: x[0])

    # Extract title
    cleaned = p
    if time_substr:
        cleaned = cleaned.replace(time_substr, " ")
    for _, dname in found_days:
        cleaned = re.sub(rf"\b{dname}\b", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b(i\s+have\s+(?:a|an)?|there\s+is\s+(?:a|an)?|schedule\s+my|schedule|add|book|plan)\b", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b(every|each|on|at|for|my|from|to|today|tomorrow|tonight)\b", " ", cleaned, flags=re.IGNORECASE)
    words = [w for w in cleaned.split() if w.lower() not in ("schedule", "calendar", "event", "timetable", "have", "i")]
    if words and words[0].lower() in ("a", "an", "the"):
        words = words[1:]
    if words:
        title = " ".join(w.capitalize() for w in words)
    else:
        title = "Scheduled Session"

    time_display = f"{time_str} - {end_time}" if end_time else time_str

    # If no days of the week found, this is a ONE-TIME event
    if not found_days:
        target_date = datetime.now()
        if re.search(r"\btomorrow\b", p, re.IGNORECASE):
            target_date += timedelta(days=1)
        date_str = target_date.strftime("%Y-%m-%d")
        scheduled_at = f"{date_str}T{time_str}:00"

        action_args: dict[str, Any] = {
            "character_id": character_id,
            "title": title,
            "time": time_str,
            "schedule_type": "ONCE",
            "scheduled_at": scheduled_at,
        }
        if end_time:
            action_args["end_time"] = end_time

        return {
            "action_type": "create_calendar_schedule",
            "action_args": action_args,
            "summary": f"CALENDAR: Add one-time '{title}' at {time_display} on {date_str}.",
        }

    # Single recurring day
    if len(found_days) == 1:
        dow, dname = found_days[0]
        action_args = {
            "character_id": character_id,
            "title": title,
            "time": time_str,
            "schedule_type": "WEEKLY",
            "day_of_week": dow,
        }
        if end_time:
            action_args["end_time"] = end_time

        return {
            "action_type": "create_calendar_schedule",
            "action_args": action_args,
            "summary": f"CALENDAR: Add weekly '{title}' every {dname} at {time_display}.",
        }
    else:
        # Multiple recurring days
        day_names = [d[1] for d in found_days]
        schedules = [
            {
                "character_id": character_id,
                "title": title,
                "time": time_str,
                "schedule_type": "WEEKLY",
                "day_of_week": d[0],
                **({"end_time": end_time} if end_time else {}),
            }
            for d in found_days
        ]
        day_list = " + ".join(day_names)
        action_args = {
            "schedules": schedules,
            "title": title,
            "time": time_str,
            "days": day_names,
        }
        if end_time:
            action_args["end_time"] = end_time

        return {
            "action_type": "create_calendar_schedule_multi",
            "action_args": action_args,
            "summary": f"CALENDAR: Add weekly '{title}' every {day_list} at {time_display}.",
        }


def get_gemini_client():
    """
    Lazy-loads GEMINI_API_KEY from environment and initializes Gemini client
    on-demand inside the function scope to minimize startup memory overhead.
    """
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or api_key == "your-api-key-here":
        print("[AIRA Service Warning] GEMINI_API_KEY missing or invalid in server/.env. Using local Ciel fallback persona.")
        return None

    # 1. Modern google.genai SDK
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        return client
    except ImportError:
        pass
    except Exception as e:
        print(f"[AIRA Service Warning] Failed to initialize google.genai Client: {e}")

    # 2. Legacy google.generativeai SDK fallback
    try:
        import google.generativeai as legacy_genai
        legacy_genai.configure(api_key=api_key)
        return legacy_genai
    except ImportError:
        pass
    except Exception as e:
        print(f"[AIRA Service Warning] Failed to configure google.generativeai: {e}")

    return None


def call_gemini_generate(client, prompt: str) -> Optional[str]:
    """
    Generates content using modern client.models.generate_content or client.chats.create() lazily.
    """
    if not client:
        return None

    # 1. Modern google.genai SDK
    if hasattr(client, "models"):
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                system_instruction=AIRA_SYSTEM_PROMPT
            )
            for model_name in [
                "gemini-3.6-flash",
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
            ]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception:
                    continue
        except Exception as e:
            print(f"[AIRA Service Warning] google-genai generate_content failed: {e}")

    # 2. Fallback: chat.send_message
    if hasattr(client, "chats"):
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                system_instruction=AIRA_SYSTEM_PROMPT
            )
            for model_name in ["gemini-3.6-flash", "gemini-3.5-flash-lite"]:
                try:
                    chat = client.chats.create(model=model_name, config=config)
                    response = chat.send_message(prompt)
                    if response and response.text:
                        return response.text.strip()
                except Exception:
                    continue
        except Exception:
            pass

    return None


async def call_gemini_with_tools_async(client, full_prompt: str, character_id: str) -> Dict[str, Any]:
    """
    Calls Gemini utilizing client.aio.chats.create() and await chat.send_message()
    for Phase A read and recommendation tools only.
    """
    try:
        from google.genai import types
        
        system_instruction = AIRA_SYSTEM_PROMPT + f"\n[CRITICAL]: The Master's character_id is '{character_id}'. Pass this exact string to any tool you call."
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=AIRA_TOOLS,
            tool_config=types.ToolConfig(
                function_calling_config=types.FunctionCallingConfig(mode="AUTO")
            ),
            temperature=0.7
        )
        
        fallback_models = [
            "gemini-3.6-flash",
            "gemini-3.5-flash-lite",
            "gemini-flash-latest"
        ]

        chat = None
        for m in fallback_models:
            try:
                chat = client.chats.create(model=m, config=config)
                break
            except Exception as e:
                print(f"[AIRA Service Debug] Failed to create chat session with model {m}: {e}")
                
        if not chat:
            text_res = call_gemini_generate(client, full_prompt)
            return {"response": text_res or "Calculation complete. Standing by for Master's orders.", "pending_action": None}

        # Send initial message through chat session with 4.0s timeout
        try:
            response = await asyncio.wait_for(asyncio.to_thread(chat.send_message, full_prompt), timeout=4.0)
        except Exception as e:
            print(f"[AIRA Service Debug] chat.send_message timed out or failed: {e}")
            response = None

        # Debug: log what Gemini returned
        has_fn_calls = hasattr(response, 'function_calls') and bool(getattr(response, 'function_calls', None))
        resp_text = getattr(response, 'text', None)
        print(f"[AIRA Debug] function_calls={[fc.name for fc in response.function_calls] if has_fn_calls else []}, text_snippet={str(resp_text)[:120] if resp_text else None}")

        MUTATIVE_TOOLS: set[str] = {
            "create_habit",
            "update_habit",
            "archive_habit",
            "complete_daily_mission",
            "create_automation_rule",
            "toggle_automation_rule",
            "delete_automation_rule",
            "create_calendar_schedule",
            "delete_calendar_schedule",
            "log_workout",
            "equip_inventory_item",
            "generate_progression_plan",
        }

        def _build_calendar_summary(fn_args: dict) -> str:
            """Builds a human-readable summary line for a single create_calendar_schedule call."""
            stype = fn_args.get("schedule_type", fn_args.get("scheduleType", "WEEKLY"))
            title_str = fn_args.get("title", "Schedule")
            time_str = fn_args.get("time", "")
            end_time_str = fn_args.get("end_time", fn_args.get("endTime", ""))
            time_display = f"{time_str} - {end_time_str}" if end_time_str else time_str
            if stype == "WEEKLY":
                dow = fn_args.get("day_of_week", fn_args.get("dayOfWeek", ""))
                DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                day_name = DAYS[int(dow)] if dow is not None and str(dow).isdigit() else str(dow)
                return f"CALENDAR: Add weekly '{title_str}' every {day_name} at {time_display}."
            else:
                date_str = str(fn_args.get('scheduled_at', fn_args.get('scheduledAt', '')))[:10]
                return f"CALENDAR: Add one-time '{title_str}' at {time_display} on {date_str}."

        all_function_calls = []
        if hasattr(response, 'function_calls') and response.function_calls:
            all_function_calls.extend(response.function_calls)

        # Inspect chat history for any function calls executed during automatic function calling
        if not all_function_calls and hasattr(chat, 'get_history'):
            try:
                for msg in chat.get_history():
                    for part in getattr(msg, 'parts', []) or []:
                        fc = getattr(part, 'function_call', None)
                        if fc and not any(getattr(existing, 'name', '') == getattr(fc, 'name', '') and getattr(existing, 'args', {}) == getattr(fc, 'args', {}) for existing in all_function_calls):
                            all_function_calls.append(fc)
            except Exception as e:
                print(f"[AIRA Service Debug] Error inspecting chat history: {e}")

        if all_function_calls:
            # Separate calendar schedule calls (can be multiple for multi-day) from other mutative tools
            calendar_calls: list[dict] = []
            first_non_calendar_mutative: tuple[str, dict] | None = None

            for fn_call in all_function_calls:
                fn_name = fn_call.name
                fn_args = fn_call.args or {}
                print(f"[AIRA Tool Call] Found {fn_name} with args {fn_args}")

                if fn_name == "create_calendar_schedule":
                    calendar_calls.append(fn_args)
                elif fn_name in MUTATIVE_TOOLS and first_non_calendar_mutative is None:
                    first_non_calendar_mutative = (fn_name, fn_args)

            # Handle multi-day calendar scheduling — bundle into a single multi-schedule action
            if calendar_calls:
                if len(calendar_calls) == 1:
                    fn_args = calendar_calls[0]
                    summary_text = _build_calendar_summary(fn_args)
                    return {
                        "response": "<< Notice. >> Calculation complete. I have prepared a calendar schedule entry. Confirm to commit.",
                        "pending_action": {
                            "action_type": "create_calendar_schedule",
                            "action_args": fn_args,
                            "summary": summary_text,
                        },
                    }
                else:
                    # Multiple days: bundle into one multi-schedule action
                    DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    day_names = []
                    for call in calendar_calls:
                        dow = call.get("day_of_week", call.get("dayOfWeek", ""))
                        if dow is not None and str(dow).isdigit():
                            day_names.append(DAYS[int(dow)])
                        else:
                            day_names.append(str(dow))
                    title_str = calendar_calls[0].get("title", "Schedule")
                    time_str = calendar_calls[0].get("time", "")
                    end_time_str = calendar_calls[0].get("end_time", calendar_calls[0].get("endTime", ""))
                    time_display = f"{time_str} - {end_time_str}" if end_time_str else time_str
                    day_list = " + ".join(day_names)
                    summary_text = f"CALENDAR: Add weekly '{title_str}' every {day_list} at {time_display}."
                    return {
                        "response": f"<< Notice. >> Calculation complete. I have prepared {len(calendar_calls)} calendar entries ({day_list}). Confirm to commit all.",
                        "pending_action": {
                            "action_type": "create_calendar_schedule_multi",
                            "action_args": {
                                "schedules": calendar_calls,
                                "title": title_str,
                                "time": time_str,
                                "days": day_names,
                            },
                            "summary": summary_text,
                        },
                    }

            # Handle all other single mutative tool calls
            if first_non_calendar_mutative:
                fn_name, fn_args = first_non_calendar_mutative
                summary_text = f"Confirmation required for: {fn_name}"
                if fn_name == "log_completed_workout":
                    summary_text = f"WORKOUT: Log {fn_args.get('sets')}x{fn_args.get('reps')} {fn_args.get('exercise_name')} at {fn_args.get('weight')}kg."
                elif fn_name == "complete_daily_mission":
                    summary_text = f"MISSION: Complete '{fn_args.get('mission_title', 'Mission')}'."
                elif fn_name == "create_new_mission":
                    summary_text = f"MISSION: Create new mission '{fn_args.get('title')}' ({fn_args.get('stat_type', 'strength')})."
                elif fn_name == "delete_mission":
                    summary_text = f"MISSION: Remove mission '{fn_args.get('mission_title', 'Mission')}'."
                elif fn_name == "create_habit":
                    summary_text = f"HABIT: Create '{fn_args.get('name')}' in category {fn_args.get('category', 'General')} [{fn_args.get('difficulty', 'MEDIUM')}]."
                elif fn_name == "update_habit":
                    summary_text = f"HABIT: Update '{fn_args.get('name')}' to difficulty {fn_args.get('difficulty')}."
                elif fn_name == "archive_habit":
                    summary_text = f"HABIT: Archive habit '{fn_args.get('habit_name', 'Habit')}'."
                elif fn_name == "equip_inventory_item":
                    summary_text = f"ARMORY: Equip '{fn_args.get('item_name', 'Item')}'."
                elif fn_name == "unequip_inventory_item":
                    summary_text = f"ARMORY: Unequip '{fn_args.get('item_name', 'Item')}'."
                elif fn_name == "buy_shop_item":
                    summary_text = f"SHOP: Purchase '{fn_args.get('item_name')}' for {fn_args.get('price')} {fn_args.get('currency_type', 'GOLD')}."
                elif fn_name == "spend_skill_points":
                    summary_text = f"SKILLS: Upgrade skill '{fn_args.get('skill_name')}' using Skill Points."
                elif fn_name == "equip_beast":
                    summary_text = f"BEAST: Equip companion '{fn_args.get('beast_name')}'."
                elif fn_name == "incubate_egg":
                    summary_text = f"BEAST: Start incubating {fn_args.get('egg_type', 'ELEMENTAL')} Egg."
                elif fn_name == "claim_achievement_reward":
                    summary_text = f"ACHIEVEMENT: Claim reward for '{fn_args.get('achievement_title')}'."
                elif fn_name == "create_automation_rule":
                    summary_text = f"AUTOMATION: Create rule '{fn_args.get('name')}' [Trigger: {fn_args.get('trigger_type')}]."
                elif fn_name == "toggle_automation_rule":
                    status_str = "Enable" if fn_args.get("enabled", True) else "Pause"
                    summary_text = f"AUTOMATION: {status_str} rule '{fn_args.get('rule_name')}'."
                elif fn_name == "delete_automation_rule":
                    summary_text = f"AUTOMATION: Delete rule '{fn_args.get('rule_name')}'."
                elif fn_name == "delete_calendar_schedule":
                    summary_text = f"CALENDAR: Remove schedule ID '{fn_args.get('schedule_id', fn_args.get('scheduleId', ''))}'."
                elif fn_name == "generate_progression_plan":
                    summary_text = f"PLAN: Recommended progression protocol for: '{fn_args.get('goal_description', 'Goal')}'."

                return {
                    "response": f"<< Notice. >> Calculation complete. I have prepared system mutation: {fn_name}. Confirm to commit changes.",
                    "pending_action": {
                        "action_type": fn_name,
                        "action_args": fn_args,
                        "summary": summary_text
                    }
                }

            # Second pass: execute any read-only tool calls and feed results back to Gemini
            for fn_call in all_function_calls:
                fn_name = fn_call.name
                fn_args = fn_call.args or {}
                if fn_name in MUTATIVE_TOOLS or fn_name == "create_calendar_schedule":
                    continue  # Already handled above

                tool_func = next((t for t in AIRA_TOOLS if t.__name__ == fn_name), None)
                if tool_func:
                    if inspect.iscoroutinefunction(tool_func):
                        result = await tool_func(**fn_args)
                    else:
                        result = tool_func(**fn_args)

                    print(f"[AIRA Tool Response] {fn_name} returned: {result}")

                    tool_resp_payload = result if isinstance(result, dict) else {"result": result}
                    if inspect.iscoroutinefunction(chat.send_message):
                        response = await chat.send_message(
                            types.Part.from_function_response(
                                name=fn_name,
                                response=tool_resp_payload
                            )
                        )
                    else:
                        response = chat.send_message(
                            types.Part.from_function_response(
                                name=fn_name,
                                response=tool_resp_payload
                            )
                        )

        # Check for calendar intent fallback if no tool calls matched
        cal_fallback = extract_calendar_intent(full_prompt, character_id)
        if cal_fallback:
            return {
                "response": (response.text.strip() if response and response.text else "<< Notice. >> Calculation complete. I have prepared your calendar schedule protocol. Confirm to commit."),
                "pending_action": cal_fallback,
            }

        if response and response.text:
            return {"response": response.text.strip(), "pending_action": None}

        text_res = call_gemini_generate(client, full_prompt)
        return {"response": text_res or "Calculation complete. Standing by for Master's orders.", "pending_action": None}
        
    except Exception as e:
        print(f"[AIRA Service Warning] call_gemini_with_tools_async failed: {e}")
        cal_fallback = extract_calendar_intent(full_prompt, character_id)
        if cal_fallback:
            return {
                "response": "<< Notice. >> Calculation complete. I have prepared your calendar schedule protocol. Confirm to commit.",
                "pending_action": cal_fallback,
            }
        text_res = call_gemini_generate(client, full_prompt)
        return {"response": text_res or "Calculation complete. Standing by for Master's orders.", "pending_action": None}


def format_character_context(character_context: Dict[str, Any]) -> str:
    """
    Formats character context data into clean analytical text for AIRA.
    """
    stats = character_context.get("stats") or {}
    name = character_context.get("name", "Master")
    level = character_context.get("level", 1)
    power = character_context.get("power", 50)
    rank = character_context.get("rank", "F")
    gold = character_context.get("gold", 0)

    str_val = stats.get("strength", 1)
    kno_val = stats.get("knowledge", 1)
    rec_val = stats.get("recovery", 1)
    foc_val = stats.get("focus", 1)
    dis_val = stats.get("discipline", 1)
    end_val = stats.get("endurance", 1)
    con_val = stats.get("consistency", 1)

    return (
        f"Master: {name} | Level: {level} | Power Score: {power} | Rank: {rank} | Gold: {gold}\n"
        f"Attributes: Strength={str_val}, Knowledge={kno_val}, Recovery={rec_val}, "
        f"Focus={foc_val}, Discipline={dis_val}, Endurance={end_val}, Consistency={con_val}%"
    )


async def generate_aira_response(prompt: str, character_context: Dict[str, Any], character_id: str) -> Dict[str, Any]:
    """
    Generates a response from AIRA in Ciel's persona. Falls back gracefully to analytical template
    if Gemini API key is missing or API call fails.
    """
    context_str = format_character_context(character_context)
    full_prompt = f"[System Context]\n{context_str}\n\n[Master Prompt]\n{prompt}"

    # Extract deterministic calendar intent if present in user prompt
    calendar_action = extract_calendar_intent(prompt, character_id)

    client = get_gemini_client()
    if client:
        try:
            result = await call_gemini_with_tools_async(client, full_prompt, character_id)
            if result:
                # If Gemini produced a pending_action, use it
                if result.get("pending_action"):
                    return result
                
                # If user requested scheduling but Gemini didn't attach pending_action:
                if calendar_action:
                    resp_text = result.get("response") or (
                        f"<< Notice. >> Analysis complete with 100% calculation accuracy. "
                        f"I have prepared your calendar schedule protocol. Confirm to commit."
                    )
                    return {
                        "response": resp_text,
                        "pending_action": calendar_action,
                    }

                if result.get("response") and result.get("response") not in ["Analysis failed.", "Calculation complete. Standing by for Master's orders."]:
                    return result
        except Exception as e:
            print(f"[AIRA Service Warning] Error in call_gemini_with_tools_async: {e}")

        # If calendar intent was present but tools failed, try text generation
        if calendar_action:
            direct_text = call_gemini_generate(client, full_prompt)
            return {
                "response": direct_text or (
                    f"<< Notice. >> Analysis complete with 100% calculation accuracy. "
                    f"I have prepared your calendar schedule protocol. Confirm to commit."
                ),
                "pending_action": calendar_action,
            }

        # Try direct text generation if AFC did not produce custom content
        direct_text = call_gemini_generate(client, full_prompt)
        if direct_text:
            return {"response": direct_text, "pending_action": None}

    # Fallback if no client or all API calls failed
    if calendar_action:
        return {
            "response": (
                f"<< Notice. >> Analysis complete with 100% calculation accuracy. "
                f"I have prepared your calendar schedule protocol. Confirm to commit."
            ),
            "pending_action": calendar_action,
        }

    power = character_context.get("power", 50)
    level = character_context.get("level", 1)
    fallback_text = (
        f"<< Answer. >> Analysis complete with 100% calculation accuracy. "
        f"Master's query has been registered for Skill Acquisition optimization."
    )
    return {"response": fallback_text, "pending_action": None}



async def analyze_tower_combat(
    character_data: Dict[str, Any],
    battle_logs: List[str],
    floor_number: int = 1,
    is_victory: bool = False,
    turns_elapsed: int = 0,
    player_hp: int = 0
) -> str:
    """
    Analyzes battle logs and character attributes to provide tactical Ciel-style combat analysis.
    """
    context_str = format_character_context(character_data)
    log_sample = (
        "\n".join(battle_logs[-10:]) if battle_logs else "No battle log entries recorded."
    )

    if is_victory:
        prompt = (
            f"[Task: Victory Analysis for Tower Floor {floor_number}]\n"
            f"Context:\n{context_str}\n\n"
            f"Turns: {turns_elapsed} | Remaining HP: {player_hp}\n"
            f"Recent Battle Log Sample:\n{log_sample}\n\n"
            f"Provide a Ciel-style tactical summary of Master's victory on Floor {floor_number}. "
            f"Acknowledge the efficiency (Turns: {turns_elapsed}, HP: {player_hp}). Commend them but remind them the next floor will require further Attribute Enhancement."
        )
    else:
        prompt = (
            f"[Task: Defeat Analysis for Tower Floor {floor_number}]\n"
            f"Context:\n{context_str}\n\n"
            f"Turns survived: {turns_elapsed}\n"
            f"Recent Battle Log Sample:\n{log_sample}\n\n"
            f"Diagnose the primary attribute deficiency that caused Master's loss on Floor {floor_number}. "
            f"Recommend specific real-life habits (Skill Acquisition routines like Workout, Study, Sleep, Discipline) "
            f"to increase the deficient stat and raise Master's victory probability above 95%."
        )

    client = get_gemini_client()
    if client:
        result_text = call_gemini_generate(client, prompt)
        if result_text:
            return result_text

    stats = character_data.get("stats") or {}
    
    if is_victory:
        return (
            f"<< Report. >> Combat Simulation Analysis on Floor {floor_number} complete. "
            f"Master secured victory in {turns_elapsed} turns with {player_hp} HP remaining. "
            f"Optimal performance achieved. I recommend continuing daily Skill Acquisition to prepare for upper floors."
        )

    rec = stats.get("recovery", 1)
    dis = stats.get("discipline", 1)
    str_val = stats.get("strength", 1)

    weakest_stat = "Recovery"
    if str_val <= rec and str_val <= dis:
        weakest_stat = "Strength"
    elif dis <= rec:
        weakest_stat = "Discipline"

    return (
        f"<< Report. >> Combat Simulation Analysis on Floor {floor_number} complete. "
        f"Calculation confirms a 100% probability that Master's defeat was caused by an Attribute deficit in {weakest_stat}. "
        f"Current {weakest_stat} coefficient is sub-optimal for Floor {floor_number} dungeon guardians. "
        f"I strongly advise initializing 3 consecutive days of {weakest_stat} Skill Acquisition routines in real life. "
        f"This will enhance Master's Combat Power and raise victory probability to 98.4%."
    )


async def generate_daily_report(
    character_context: Dict[str, Any],
    pending_habits_count: int = 0,
) -> str:
    """
    Generates AIRA's signature morning briefing report.
    """
    context_str = format_character_context(character_context)
    prompt = (
        f"[Task: Daily Morning Briefing]\n"
        f"Context:\n{context_str}\n"
        f"Pending Daily Missions: {pending_habits_count}\n\n"
        f"Generate a concise, analytical Ciel-style morning report. Include Master's current Power Score, "
        f"consistency calculation, pending Skill Acquisitions, and a quietly devoted encouragement."
    )

    client = get_gemini_client()
    if client:
        result_text = call_gemini_generate(client, prompt)
        if result_text:
            return result_text

    power = character_context.get("power", 50)
    name = character_context.get("name", "Master")
    stats = character_context.get("stats") or {}
    consistency = stats.get("consistency", 100)

    return (
        f"<< Report. >> Good morning, {name}. System diagnostic complete with 100% accuracy.\n"
        f"Master's current Power Score is {power} with a {consistency:.1f}% Consistency coefficient. "
        f"There are currently {pending_habits_count} pending Skill Acquisition tasks scheduled for today. "
        f"I shall monitor your progress and ensure optimal Attribute Enhancement throughout the cycle."
    )


async def analyze_boss_trajectory(
    character_context: Dict[str, Any],
    boss_data: Dict[str, Any],
    damage_logs: List[Dict[str, Any]],
) -> str:
    """
    Analyzes Boss Damage Log history and compares current velocity to remaining HP and deadline.
    """
    context_str = format_character_context(character_context)
    
    boss_name = boss_data.get("name", "Unknown Boss")
    max_hp = boss_data.get("maxHp", 10000)
    current_hp = boss_data.get("currentHp", 10000)
    deadline = boss_data.get("deadline", "None")
    
    # Calculate some basic metrics
    total_damage = max_hp - current_hp
    
    prompt = (
        f"[Task: Boss Trajectory Analysis]\n"
        f"Context:\n{context_str}\n\n"
        f"Boss Name: {boss_name}\n"
        f"Total HP: {max_hp} | Current HP: {current_hp} (Damage Dealt: {total_damage})\n"
        f"Deadline: {deadline}\n"
        f"Recent Damage Logs count: {len(damage_logs)}\n\n"
        f"Act as Ciel (AIRA). Analyze the current trajectory against the {boss_name} boss. "
        f"Calculate the apparent pace of damage dealing based on the remaining HP and deadline (if any). "
        f"If the pace is good, commend Master with exact numbers. If falling behind, issue a tactical warning to increase Skill Acquisition (habit) completion rates."
    )

    client = get_gemini_client()
    if client:
        result_text = call_gemini_generate(client, prompt)
        if result_text:
            return result_text

    # Fallback response
    if current_hp <= max_hp / 2:
        return (
            f"<< Report. >> Trajectory analysis for {boss_name} complete. "
            f"Master has successfully depleted over 50% of the target's vitality. "
            f"At the current velocity, victory probability is exceedingly high. Maintain current Skill Acquisition routines."
        )
    else:
        return (
            f"<< Warning. >> Trajectory analysis for {boss_name} indicates sub-optimal damage velocity. "
            f"Target HP remains dangerously high at {current_hp}. "
            f"I recommend temporarily increasing the completion rate of your daily Skill Acquisition tasks to accelerate damage output."
        )


async def analyze_workout_performance(character_context: Dict[str, Any], workout_ranks: List[Dict[str, Any]]) -> str:
    """
    Evaluates the character's recent WorkoutSet history and PR data to identify trends
    and generate a tactical assessment.
    """
    context_str = format_character_context(character_context)
    
    ranks_str = ""
    for r in workout_ranks:
        ranks_str += f"- {r['exerciseName']}: Rank {r['currentRank']} (e1RM: {r.get('e1rm', 0)} kg)\n"
        
    prompt = (
        f"[Task: Workout Performance Analysis]\n"
        f"Context:\n{context_str}\n\n"
        f"Recent Exercise Ranks:\n{ranks_str}\n\n"
        f"Act as Ciel (AIRA). Analyze the character's recent workout ranks to identify trends. "
        f"Compare their pushing strength (e.g. Bench) vs pulling strength (e.g. Row/Deadlift) vs legs (Squat). "
        f"If there is a severe imbalance (e.g., Rank A in one, Rank C in another), point it out specifically. "
        f"Generate a brief, tactical assessment recommending specific movements or focus areas to achieve optimal balance."
    )

    client = get_gemini_client()
    if client:
        result_text = call_gemini_generate(client, prompt)
        if result_text:
            return result_text

    return (
        f"<< Report. >> Workout analysis complete with 100% accuracy. Master currently has {len(workout_ranks)} tracked exercises. "
        f"I recommend maintaining consistency across all muscle groups to prevent imbalances and optimize overall Fitness Power."
    )

async def analyze_shop_efficiency(character_context: Dict[str, Any], shop_items: List[Dict[str, Any]], inventory: List[Dict[str, Any]]) -> str:
    """
    Evaluates the player's current equipped gear vs the shop's available offerings, combined with their current Gold/Gem balances.
    Generates tactical advice on the best purchases.
    """
    context_str = format_character_context(character_context)
    
    shop_str = ""
    for item in shop_items:
        shop_str += f"- {item['name']} ({item['rarity']} {item['type']}): {item['price']} {item['currencyType']} (Requires Level {item['requiredLevel']})\n"
        
    inv_str = ""
    for inv in inventory:
        inv_str += f"- [Equipped] {inv['name']} ({inv['rarity']} {inv['type']}): Stats [{inv.get('stats', 'N/A')}]\n"
        
    prompt = (
        f"[Task: Shop Efficiency Analysis]\n"
        f"Context:\n{context_str}\n\n"
        f"Currently Equipped Gear:\n{inv_str}\n\n"
        f"Available Shop Items:\n{shop_str}\n\n"
        f"Act as Ciel (AIRA). Generate an ultra-concise shop analysis.\n"
        f"STRICT INSTRUCTIONS:\n"
        f"- Limit total response to 2–3 short sentences maximum (under 60 words).\n"
        f"- Focus strictly on:\n"
        f"  1. The single best item to buy (or state if insolvent).\n"
        f"  2. The exact Gold short deficit if insolvent.\n"
        f"  3. One actionable recommendation.\n"
        f"- Eliminate long math breakdowns, infinite percentage calculations, and multi-paragraph status listings."
    )

    client = get_gemini_client()
    if client:
        result_text = call_gemini_generate(client, prompt)
        if result_text:
            return result_text

    gold = character_context.get("gold", 0)
    return (
        f"Market analysis complete for your {gold} Gold balance. "
        f"Equip the highest power item available or complete daily missions to resolve any deficit."
    )

async def generate_proactive_insight(character_id: str) -> Optional[str]:
    """
    Analyzes the last 7 days of Mission data to detect negative trends.
    If a negative trend is found, returns a short Ciel warning string.
    Returns None if the system is optimal.
    """
    from db import db
    import datetime

    # Check for missed missions in the last 7 days
    seven_days_ago = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
    
    missed_missions = await db.mission.find_many(
        where={
            "characterId": character_id,
            "status": "MISSED",
            "date": {"gte": seven_days_ago}
        },
        order={"date": "desc"}
    )
    
    if len(missed_missions) >= 3:
        # Detected a negative trend
        prompt = (
            f"[Task: Proactive Insight Generation]\n"
            f"Context: Master has missed {len(missed_missions)} missions in the last 7 days.\n"
            f"Act as Ciel (AIRA). Generate a very concise (1-2 sentences), analytical warning about this negative trend. "
            f"Advise them to recalibrate their schedule."
        )
        
        client = get_gemini_client()
        if client:
            result_text = call_gemini_generate(client, prompt)
            if result_text:
                return result_text
                
        return f"<< Warning. >> Critical lapse detected: {len(missed_missions)} missions missed this week. Immediate recalibration of daily routines is advised."
        
    return None
