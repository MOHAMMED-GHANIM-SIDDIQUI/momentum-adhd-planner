from __future__ import annotations

import importlib.util
import inspect
from pathlib import Path
import sys
import traceback


def load_module(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    root = Path(__file__).parent
    sys.path.insert(0, str(root))
    failures: list[str] = []
    total = 0
    for path in sorted((root / "tests").glob("test_*.py")):
        module = load_module(path)
        for name, func in sorted(inspect.getmembers(module, inspect.isfunction)):
            if not name.startswith("test_"):
                continue
            total += 1
            try:
                func()
                print(f"PASS {path.name}::{name}")
            except Exception:
                failures.append(f"{path.name}::{name}\n{traceback.format_exc()}")
                print(f"FAIL {path.name}::{name}")
    print(f"\n{total - len(failures)}/{total} tests passed")
    if failures:
        print("\n".join(failures))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
