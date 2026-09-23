"""Best-effort startup memory diagnostics without third-party dependencies."""

from pathlib import Path


def format_memory_snapshot(
    stage: str,
    process_rss_kib: int | None,
    cgroup_current_bytes: int | None,
    cgroup_limit_bytes: int | None,
) -> str:
    fields = [f"stage={stage}"]

    if process_rss_kib is not None:
        fields.append(f"process_rss_mib={process_rss_kib / 1024:.1f}")
    if cgroup_current_bytes is not None:
        fields.append(f"container_current_mib={cgroup_current_bytes / 1048576:.1f}")
    if cgroup_limit_bytes is not None and cgroup_limit_bytes > 0:
        fields.append(f"container_limit_mib={cgroup_limit_bytes / 1048576:.1f}")
        if cgroup_current_bytes is not None:
            usage_percent = cgroup_current_bytes * 100 / cgroup_limit_bytes
            fields.append(f"container_usage_percent={usage_percent:.1f}")

    if len(fields) == 1:
        fields.append("memory=unavailable")

    return "[startup-memory] " + " ".join(fields)


def _read_integer(path: Path) -> int | None:
    try:
        value = path.read_text(encoding="ascii").strip()
        return int(value) if value and value != "max" else None
    except (OSError, ValueError):
        return None


def _read_process_rss_kib() -> int | None:
    try:
        for line in Path("/proc/self/status").read_text(encoding="ascii").splitlines():
            if line.startswith("VmRSS:"):
                return int(line.split()[1])
    except (OSError, ValueError, IndexError):
        pass
    return None


def _read_cgroup_memory() -> tuple[int | None, int | None]:
    current = _read_integer(Path("/sys/fs/cgroup/memory.current"))
    limit = _read_integer(Path("/sys/fs/cgroup/memory.max"))
    if current is not None or limit is not None:
        return current, limit

    current = _read_integer(Path("/sys/fs/cgroup/memory/memory.usage_in_bytes"))
    limit = _read_integer(Path("/sys/fs/cgroup/memory/memory.limit_in_bytes"))
    return current, limit


def log_startup_memory(stage: str) -> None:
    """Log current process and container memory when Linux exposes the metrics."""
    cgroup_current, cgroup_limit = _read_cgroup_memory()
    print(
        format_memory_snapshot(
            stage,
            _read_process_rss_kib(),
            cgroup_current,
            cgroup_limit,
        ),
        flush=True,
    )
