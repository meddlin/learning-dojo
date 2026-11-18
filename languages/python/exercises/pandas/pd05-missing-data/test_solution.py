import numpy as np
import pandas as pd

from dojo_test import equal, frame_equal
from solution import dedupe, drop_incomplete, fill_defaults, forward_fill_temps, missing_counts, rows_with_missing

NAN = np.nan


def readings():
    return pd.DataFrame(
        {
            "sensor": ["A", "A", "A", "B", "B", "B"],
            "day": [1, 2, 3, 1, 2, 3],
            "temp": [20.5, NAN, 22.0, NAN, 18.0, NAN],
            "humidity": [40.0, 42.0, NAN, NAN, NAN, 50.0],
            "note": ["ok", None, None, "check", None, None],
        }
    )


def test_missing_counts():
    equal(missing_counts(readings()), {"sensor": 0, "day": 0, "temp": 3, "humidity": 3, "note": 4})


def test_rows_with_missing():
    equal(rows_with_missing(readings()), 5)
    equal(rows_with_missing(readings()[["sensor", "day", "temp"]]), 3)


def test_drop_incomplete():
    df = readings()
    frame_equal(drop_incomplete(df, ["temp"]), df.loc[[0, 2, 4]])
    frame_equal(drop_incomplete(df, ["temp", "humidity"]), df.loc[[0]])
    frame_equal(drop_incomplete(df, []), df)


def test_fill_defaults():
    df = readings()
    out = fill_defaults(df)
    equal(out["temp"].tolist(), [20.5, 20.2, 22.0, 20.2, 18.0, 20.2])
    equal(out["humidity"].tolist(), [40.0, 42.0, 0.0, 0.0, 0.0, 50.0])
    equal(out["note"].tolist(), ["ok", "none", "none", "check", "none", "none"])
    equal(int(df["temp"].isna().sum()), 3, "the input frame must not change")


def test_forward_fill_temps_stays_within_each_sensor():
    out = forward_fill_temps(readings())
    temps = out["temp"].tolist()
    equal(temps[:3], [20.5, 20.5, 22.0])
    equal(bool(np.isnan(temps[3])), True, "B's first reading has nothing before it in B: it must stay missing, not take A's 22.0")
    equal(temps[4:], [18.0, 18.0])
    equal(out["humidity"].isna().sum(), 3, "only temp is filled")


def test_dedupe():
    df = pd.concat([readings(), readings().iloc[[0, 4]]])
    out = dedupe(df)
    frame_equal(out, readings())
