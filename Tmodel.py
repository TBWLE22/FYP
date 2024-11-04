import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

# Function to load and concatenate all parquet files in a folder
def load_parquet_files(folder_path):
    parquet_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.parquet')]
    df_list = [pd.read_parquet(file) for file in parquet_files]
    concatenated_df = pd.concat(df_list, ignore_index=True)
    return concatenated_df

# Load the dataset
folder_path = r'D:\IP Spoof Controller\Datasets'  # Replace with the actual folder path
df = load_parquet_files(folder_path)

# Encoding categorical features
label_encoder = LabelEncoder()

# Assume the 'Label' column contains the target labels for classification
df['Label'] = label_encoder.fit_transform(df['Label'])

# Split data into features (X) and target (y)
X = df.drop('Label', axis=1)
y = df['Label']

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the RandomForestClassifier
model = RandomForestClassifier()

# Train the model
model.fit(X_train, y_train)

# Predict on the test set
y_pred = model.predict(X_test)

# Evaluate the model
print("Accuracy:", accuracy_score(y_test, y_pred))

# Convert the encoded labels back to original form for the classification report
target_names = label_encoder.inverse_transform(np.unique(y_test))

# Print classification report
print("Classification Report:")
print(classification_report(y_test, y_pred, target_names=target_names))


