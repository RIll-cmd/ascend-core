from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from startup_diagnostics import format_memory_snapshot


def test_memory_snapshot_formats_process_and_container_usage():
    message = format_memory_snapshot(
        "db_connect_start",
        process_rss_kib=12 * 1024,
        cgroup_current_bytes=16 * 1024 * 1024,
        cgroup_limit_bytes=512 * 1024 * 1024,
    )

    assert "stage=db_connect_start" in message
    assert "process_rss_mib=12.0" in message
    assert "container_current_mib=16.0" in message
    assert "container_limit_mib=512.0" in message
    assert "container_usage_percent=3.1" in message


def test_memory_snapshot_handles_unavailable_metrics():
    message = format_memory_snapshot(
        "before_imports",
        process_rss_kib=None,
        cgroup_current_bytes=None,
        cgroup_limit_bytes=None,
    )

    assert message == "[startup-memory] stage=before_imports memory=unavailable"
