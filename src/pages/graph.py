import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import norm
from datetime import timedelta
import seaborn as sns
import matplotlib.dates as mdates

# Load the CSV file
file_path = '/Users/seanfagan/Desktop/FloodEvents.csv'
df = pd.read_csv(file_path)

# Clean and prepare data
df['Crest Date'] = pd.to_datetime(df['Crest Date'], errors='coerce')
df['Crest Stage D.S. Gage (ft)'] = pd.to_numeric(df['Crest Stage D.S. Gage (ft)'], errors='coerce')
df = df.dropna(subset=['Crest Date', 'Crest Stage D.S. Gage (ft)'])
df = df.sort_values('Crest Date')

# --- Create Bell Curve Starting in 2010 ---
start_year = 2011
num_years = 40
peak_height = 20
mean_year = num_years // 2
std_dev = 10

# Build bell curve
x_years = np.arange(num_years)
bell_curve = norm.pdf(x_years, loc=mean_year, scale=std_dev)
bell_curve = bell_curve / bell_curve.max() * peak_height

# Generate future dates from Jan 1, 2010
future_dates = pd.date_range(start=f'{start_year}-01-01', periods=num_years, freq='YS')

# Create DataFrame for projections
df_future = pd.DataFrame({
    'Crest Date': future_dates,
    'Crest Stage D.S. Gage (ft)': bell_curve
})

# Combine historical and future data
df_combined = pd.concat([df, df_future]).sort_values('Crest Date')


# Set modern aesthetic style
sns.set(style='whitegrid', font_scale=1.2, rc={
    'axes.edgecolor': 'gray',
    'axes.linewidth': 0.8,
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.spines.left': False,
    'axes.spines.bottom': False
})

# Color palette
observed_color = '#007acc'  # soft blue
projected_color = '#ff6b6b'  # coral red

# Create figure
plt.figure(figsize=(14, 7))
plt.plot(df['Crest Date'], df['Crest Stage D.S. Gage (ft)'],
         marker='o', markersize=5, linewidth=2,
         label='Observed', color=observed_color, alpha=0.9)

plt.plot(df_future['Crest Date'], df_future['Crest Stage D.S. Gage (ft)'],
         linestyle='--', linewidth=2,
         label='GLOF Lifecycle', color=projected_color, alpha=0.8)

# Format x-axis as years
plt.gca().xaxis.set_major_locator(mdates.YearLocator(5))
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))

# Labels and title

# Legend
plt.legend(frameon=False, loc='upper right')

# Remove chart clutter
plt.grid(True, which='major', linestyle='--', linewidth=0.5, alpha=0.5)
plt.tight_layout()
plt.show()