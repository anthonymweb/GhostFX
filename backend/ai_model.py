"""AI model preparation module.

This is a placeholder for future machine learning integration. The current
application uses transparent rule-based signals. Before adding live AI-driven
decisions, train and validate models on historical data, use walk-forward
testing, and keep trading in demo mode until risk controls are mature.
"""

from __future__ import annotations

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


FEATURE_COLUMNS = [
    "rsi",
    "ema_50",
    "ema_200",
    "macd",
    "macd_signal",
    "macd_histogram",
    "ema_spread",
    "macd_spread",
    "return_1",
    "return_3",
]


def engineer_features(candles: pd.DataFrame) -> pd.DataFrame:
    """Create model-ready features from indicator-enhanced candle data."""

    features = candles.copy()
    features["ema_spread"] = features["ema_50"] - features["ema_200"]
    features["macd_spread"] = features["macd"] - features["macd_signal"]
    features["return_1"] = features["close"].pct_change()
    features["return_3"] = features["close"].pct_change(3)
    return features.dropna()


def train_model(training_data: pd.DataFrame, target: pd.Series) -> Pipeline:
    """Train a starter classification model.

    The target might be a future-return label such as:
    1 for upward move, -1 for downward move, and 0 for neutral.
    """

    features = engineer_features(training_data)
    aligned_target = target.loc[features.index]

    model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(n_estimators=200, random_state=42)),
        ]
    )
    model.fit(features[FEATURE_COLUMNS], aligned_target)
    return model


def predict_signal_probability(model: Pipeline, latest_data: pd.DataFrame) -> dict:
    """Return class probabilities for the newest candle.

    This function is intentionally generic so a future API endpoint can combine
    ML probability with the rule-based confidence score.
    """

    features = engineer_features(latest_data)
    if features.empty:
        raise ValueError("Not enough feature-ready data for prediction.")

    latest_features = features[FEATURE_COLUMNS].tail(1)
    probabilities = model.predict_proba(latest_features)[0]
    classes = model.named_steps["classifier"].classes_
    return {str(label): round(float(probability), 4) for label, probability in zip(classes, probabilities)}
