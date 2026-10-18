
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "bus_delay_model.joblib"

# Synthetic demo data only, not real Sri Lankan bus records.
records = [
    (7, 1, 15, 3, 12),
    (8, 1, 20, 4, 24),
    (9, 2, 10, 2, 5),
    (12, 3, 18, 2, 7),
    (17, 4, 25, 4, 28),
    (18, 5, 12, 4, 20),
    (14, 6, 30, 2, 10),
    (6, 0, 8, 1, 2),
    (16, 1, 22, 3, 17),
    (10, 2, 16, 1, 3),
    (7, 3, 28, 4, 26),
    (13, 4, 14, 2, 6),
    (19, 5, 18, 3, 16),
    (11, 6, 24, 2, 9),
    (8, 0, 10, 3, 11),
    (15, 2, 35, 3, 19),
    (17, 3, 12, 4, 22),
    (9, 4, 20, 1, 4),
    (18, 1, 30, 4, 31),
    (12, 5, 9, 1, 1),
    (6, 2, 16, 2, 5),
    (16, 6, 20, 3, 15),
    (10, 0, 25, 2, 8),
    (20, 4, 15, 2, 7),
    (7, 5, 18, 4, 21),
    (14, 1, 12, 1, 2),
    (13, 2, 28, 3, 16),
    (19, 3, 22, 4, 25),
    (11, 4, 10, 2, 4),
    (15, 5, 17, 3, 12),
    (8, 2, 12, 3, 10),
    (17, 6, 26, 4, 27),
    (10, 5, 15, 1, 3),
    (13, 1, 22, 2, 8),
    (18, 2, 19, 4, 23),
    (6, 4, 11, 1, 2),
    (15, 3, 30, 3, 18),
    (9, 6, 14, 2, 5),
    (7, 2, 24, 4, 25),
    (12, 0, 16, 2, 6),
    (16, 4, 18, 3, 14),
    (20, 5, 28, 3, 18),
    (11, 1, 12, 1, 3),
    (14, 2, 21, 2, 8),
    (18, 3, 15, 4, 21),
    (8, 6, 17, 2, 7),
    (13, 5, 25, 3, 14),
    (17, 2, 10, 4, 19),
    (10, 4, 18, 2, 6),
    (15, 0, 23, 3, 13),
]

columns = [
    "hour",
    "weekday",
    "distance_km",
    "traffic_level",
    "delay_minutes",
]

data = pd.DataFrame(records, columns=columns)

features = ["hour", "weekday", "distance_km", "traffic_level"]
X = data[features]
y = data["delay_minutes"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)

joblib.dump(model, MODEL_PATH)

print("AI MODEL TRAINED SUCCESSFULLY!")
print(f"Training records: {len(X_train)}")
print(f"Test records: {len(X_test)}")
print(f"Demo test MAE: {mae:.2f} minutes")
print(f"Model saved at: {MODEL_PATH}")
print("WARNING: This model uses synthetic demo data only.")
