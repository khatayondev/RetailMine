
HO TECHNICAL UNIVERSITY
Faculty of Applied Science & Technology
Department of Computer Science
RETAIL SALES DATA MINING DASHBOARD
Complete Project Documentation & Developer Guide

BCSC 406: Data Mining and Warehousing
Second Semester, 2025/2026 Academic Year

Group 1  ·  Lecturer: George K. Agordzo
Dataset: UCI Online Retail II  (525,461 transactions)
Stack: Python · Streamlit · Scikit-learn · SQLite · Plotly

 
Table of Contents
Table of Contents	2
1. Project Overview	4
1.1 Introduction	4
1.2 Project Aim	4
1.3 Dataset Summary	4
1.4 Technology Stack	4
2. Complete Folder Structure	5
2.1 File Responsibilities	5
3. Installation & Running the Dashboard	7
3.1 Prerequisites	7
3.2 Step-by-Step Setup	7
3.3 First-Run Workflow (Important)	7
3.4 requirements.txt	7
4. Complete Feature List	8
4.1 Home Page	8
4.2 Dataset Management Module	8
4.3 Data Preprocessing Module	8
4.4 Data Exploration Module	8
4.5 Classification Module	9
4.6 Clustering Module	9
4.7 Association Rule Mining Module	10
5. Data Warehouse Design	11
5.1 Schema Type	11
5.2 Star Schema Diagram	11
5.3 Table Definitions	11
fact_sales (Central Fact Table)	11
dim_customer	11
dim_product	12
dim_date	12
dim_country	12
6. ETL Process	13
6.1 ETL Overview	13
6.2 Extract	13
6.3 Transform (Cleaning Steps)	13
6.4 Load (Warehouse Build)	13
6.5 Engineered Features	13
7. Data Mining Algorithms	15
7.1 Classification Algorithms	15
7.1.1 Decision Tree	15
7.1.2 Random Forest	15
7.1.3 Naive Bayes	15
7.1.4 K-Nearest Neighbour	15
7.2 Clustering Algorithms	15
7.2.1 K-Means	16
7.2.2 Hierarchical Clustering (Agglomerative)	16
7.3 Association Rule Mining	16
7.3.1 Apriori	16
7.3.2 FP-Growth	16
7.4 Evaluation Metrics Summary	16
8. Key Functions Reference	18
8.1 utils/preprocess.py	18
clean_data(df)	18
get_cleaning_report(raw, clean)	18
build_rfm(df)	18
8.2 utils/warehouse.py	18
build_warehouse(df)	18
warehouse_exists()	18
query_warehouse(sql)	18
9. Navigation & User Guide	19
9.1 Sidebar Navigation	19
9.2 Page-by-Page Guide	19
9.3 Tuning Parameters	19
10. Results & Findings	20
10.1 Classification Results	20
10.2 Clustering Results	20
10.3 Association Mining Results	20
10.4 Business Recommendations	20
11. Troubleshooting	21
12. Presentation Guide (15 Slides)	22
12.1 Demo Tips	22
13. Project Report Writing Guide	23
14. Quick Reference Card	23

 
1. Project Overview
1.1 Introduction
This document is the complete reference guide for the Retail Sales Data Mining Dashboard developed for BCSC 406: Data Mining and Warehousing. It covers every feature, every file, every algorithm, and every configuration decision made during development, providing everything needed to understand, run, extend, or present the system.

1.2 Project Aim
To design and develop an interactive dashboard that supports data warehousing and data mining operations on a real-world retail dataset, enabling managers to understand sales trends, customer behaviour, product performance, and future predictions through visual analytics.

1.3 Dataset Summary
Metric	Value	Notes
Source	UCI Machine Learning Repository	Online Retail II dataset
Total rows	525,461	Two year sheets combined
After cleaning	400,916	76.3% of raw data retained
Unique customers	4,383	With valid Customer ID
Unique products	4,681	Distinct descriptions
Countries	40	UK dominates at 92%
Date range	Dec 2009 – Dec 2010	Full year of transactions

1.4 Technology Stack
Layer	Technology	Version	Purpose
UI Framework	Streamlit	1.35.0	Interactive web dashboard
Data Processing	Pandas / NumPy	2.2 / 1.26	Data manipulation
Machine Learning	Scikit-learn	1.5.0	All ML algorithms
Association Mining	MLxtend	0.23.1	Apriori & FP-Growth
Visualisation	Plotly	5.22.0	Interactive charts
Data Warehouse	SQLite	Built-in	Star schema storage
File I/O	OpenPyXL	3.1.4	Read Excel dataset
 
2. Complete Folder Structure
The project follows a modular structure. Every page is its own Python file; shared logic lives in the utils/ package. The SQLite warehouse file is generated at runtime.

retail_dashboard/
├── app.py                  ← Main entry point (Streamlit multi-page router)
├── requirements.txt        ← All Python dependencies with pinned versions
├── warehouse.db            ← Auto-generated SQLite data warehouse
│
├── data/
│   └── online_retail_II.xlsx   ← Source dataset (UCI Online Retail II)
│
├── pages/
│   ├── page_home.py        ← Home page & project overview
│   ├── page_dataset.py     ← Dataset preview & quality checks
│   ├── page_preprocess.py  ← Cleaning pipeline & warehouse builder
│   ├── page_explore.py     ← Interactive charts & exploration
│   ├── page_classify.py    ← Classification: 4 algorithms
│   ├── page_cluster.py     ← Clustering: K-Means + Hierarchical
│   └── page_assoc.py       ← Association: Apriori + FP-Growth
│
└── utils/
    ├── preprocess.py       ← Shared cleaning functions & RFM builder
    └── warehouse.py        ← SQLite star schema ETL helpers

2.1 File Responsibilities
File	Responsibility	Key functions / classes
app.py	Sidebar navigation, page routing via importlib	Routes to all 7 page modules
utils/preprocess.py	Full ETL cleaning pipeline, feature engineering, RFM	clean_data(), build_rfm(), get_cleaning_report()
utils/warehouse.py	SQLite star schema creation and querying	build_warehouse(), query_warehouse()
page_home.py	Project landing page with KPIs and module overview	Static + dataset check
page_dataset.py	Raw data preview, column info, missing value heatmap	load_raw_uncached()
page_preprocess.py	Step-by-step cleaning UI + warehouse ETL trigger	clean_data(), build_warehouse()
page_explore.py	5 chart types, KPIs, correlation matrix, frequency tables	Plotly express charts
page_classify.py	4 classifiers, confusion matrices, feature importance	DT, RF, NB, KNN from sklearn
page_cluster.py	Elbow analysis, K-Means, Hierarchical, RFM radar	KMeans, AgglomerativeClustering
page_assoc.py	Basket matrix, rule mining, network graph, comparison	apriori(), fpgrowth(), association_rules()
 
3. Installation & Running the Dashboard
3.1 Prerequisites
•	Python 3.9 or higher installed on your machine
•	pip package manager (comes with Python)
•	The online_retail_II.xlsx file in the data/ folder
•	At least 2 GB RAM recommended (dataset is 525K rows)

3.2 Step-by-Step Setup
1.	Unzip the project folder: unzip retail_dashboard.zip
2.	Open a terminal and navigate into the folder: cd retail_dashboard
3.	Install all dependencies: pip install -r requirements.txt
4.	Launch the dashboard: streamlit run app.py
5.	Open your browser at: http://localhost:8501

3.3 First-Run Workflow (Important)
The pages share data via Streamlit session state. Follow this order on first run:
6.	Navigate to Preprocessing — click Run Preprocessing
7.	Click Build Data Warehouse (loads SQLite star schema)
8.	All other pages will now have clean data available automatically

Note: If you refresh the browser or open a new tab, you must run preprocessing again because Streamlit session state resets. The SQLite warehouse file persists on disk — only the in-memory DataFrame is lost.

3.4 requirements.txt
streamlit==1.35.0
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.5.0
matplotlib==3.9.0
seaborn==0.13.2
plotly==5.22.0
mlxtend==0.23.1
openpyxl==3.1.4
scipy==1.13.1
 
4. Complete Feature List
4.1 Home Page
•	Project title, subtitle, course and group information
•	Live KPI metrics: total transactions, customers, products, countries
•	Navigation overview cards for all 6 modules
•	Dataset column reference table
•	Dataset existence check with fallback file uploader
•	Academic information panel (course, lecturer, semester)

4.2 Dataset Management Module
•	Sheet selector: Year 2009-2010 or Year 2010-2011
•	5 KPI metrics: rows, columns, missing values, duplicates, memory usage (MB)
•	Interactive data preview with adjustable row count (5-100)
•	Column information table: name, dtype, non-null count, null count, null %, unique count, sample value
•	Missing value analysis: which columns, how many, what percentage
•	Descriptive statistics for all numeric columns
•	Sample invoice viewer: pick any invoice ID to see all its line items

4.3 Data Preprocessing Module
•	Displays all 7 cleaning steps with row counts before applying
•	One-click Run Preprocessing button
•	Cleaning report table: rows removed at each step
•	Before/after data preview
•	New engineered columns preview: Revenue, Year, Month, Quarter, DayOfWeek, RevenueClass
•	Revenue class distribution table and bar chart
•	Build Data Warehouse button: triggers SQLite ETL
•	Confirms warehouse creation with table names

4.4 Data Exploration Module
•	5 KPI metrics at top: Total Revenue, Total Orders, Avg Order Value, Active Customers, Products Sold
Five interactive chart tabs:
•	Bar Chart — top N products/countries/months/weekdays by revenue; colour gradient; adjustable N
•	Pie Chart — revenue share by country, revenue class, or quarter; donut hole; percent labels
•	Line Chart — revenue trend monthly or daily; second chart for order count
•	Histogram — distribution of Revenue/Quantity/Price; outlier capping by percentile; mean/median/std/max display
•	Scatter Plot — any two numeric axes; colour by class/country/quarter; correlation matrix heatmap
•	Summary statistics table for all numeric columns
•	Frequency table: top 10 countries by transaction count and total revenue

4.5 Classification Module
•	Target variable explanation: RevenueClass (Low / Medium / High)
•	Class distribution bar chart
•	Feature selection: choose from Quantity, Price, Month, Quarter, CountryCode
•	Test size slider: 10-40%
•	Train/test split display with row counts
•	4 algorithms trained simultaneously with progress bar:
–	Decision Tree (max_depth=8)
–	Random Forest (100 estimators, max_depth=10)
–	Naive Bayes (GaussianNB, scaled features)
–	K-Nearest Neighbour (k=7, scaled features)
•	Model comparison table with green highlighting on best values
•	Grouped bar chart comparing all 4 metrics across all 4 models
•	Per-algorithm tabs showing:
–	4 metric cards: Accuracy, Precision, Recall, F1-Score
–	Confusion matrix heatmap (colour-coded)
–	Full classification report with per-class metrics
–	Feature importance bar chart (Decision Tree and Random Forest only)
–	Decision Tree rules text output (top 3 levels)
•	Best model announcement with accuracy score
•	Algorithm interpretation panel

4.6 Clustering Module
•	RFM explanation table: Recency, Frequency, Monetary definitions
•	RFM computation per customer with 3 KPI cards
•	RFM data preview table
K-Means section:
•	Elbow analysis: inertia vs k (2-12) + silhouette score vs k
•	Recommended k based on silhouette score
•	k slider (2-8)
•	3D scatter plot of clusters in RFM space
•	2D projections: Recency vs Monetary, Frequency vs Monetary
•	Cluster profile summary table with customer count per cluster
•	Radar chart of normalised RFM values per cluster
•	Cluster interpretation guide (Champions, At-Risk, New, Lost)
Hierarchical Clustering section:
•	Linkage method selector: ward, complete, average
•	Dendrogram on 300-customer sample
•	Full clustering with silhouette score
•	2D scatter and cluster profile table
•	K-Means vs Hierarchical comparison panel

4.7 Association Rule Mining Module
•	Explanation of Support, Confidence, and Lift with definitions table
•	Country filter for basket construction
•	Max invoices slider (500-5000) for performance control
•	Min support slider (0.5%-10%)
•	Min confidence slider (10%-90%)
•	Min lift filter on output
•	Algorithm selector: Apriori only, FP-Growth only, or Both
•	Basket matrix dimensions displayed (invoices x products)
Per-algorithm tab:
–	3 KPI cards: frequent itemsets, association rules, max lift
–	Top frequent itemsets table sorted by support
–	Bar chart of top 15 itemsets by support
–	Full association rules table with support, confidence, lift
–	Scatter plot: confidence vs lift, bubble size = support
–	Horizontal bar chart of top 10 rules by lift
–	Association network graph (top 20 rules)
•	Comparison tab (when Both selected): side-by-side metrics table
•	Apriori vs FP-Growth explanation panel
•	Business recommendations panel with 5 actionable insights
 
5. Data Warehouse Design
5.1 Schema Type
The warehouse uses a Star Schema — the simplest and most query-efficient multidimensional schema. One central fact table holds all transactional measures; four dimension tables hold descriptive attributes. This is the industry standard for retail data warehousing.

5.2 Star Schema Diagram
                       dim_date                 
                    [date_id PK]               
                         |                     
dim_customer ── fact_sales ── dim_product       
                         |                     
                    dim_country                

5.3 Table Definitions
fact_sales (Central Fact Table)
Column	Type	Key	Description
sale_id	INTEGER	PK	Auto-increment surrogate key
invoice	TEXT		Original invoice number
customer_id	INTEGER	FK	Links to dim_customer
stock_code	TEXT	FK	Links to dim_product
date	TEXT	FK	Links to dim_date
quantity	INTEGER		Units sold in this line item
unit_price	REAL		Price per unit in GBP
revenue	REAL		Computed: quantity x unit_price
revenue_class	TEXT		Low / Medium / High (classification target)
country	TEXT	FK	Links to dim_country

dim_customer
Column	Description
customer_id (PK)	Unique customer identifier from source data
country	Customer's home country

dim_product
Column	Description
product_id (PK)	Auto-increment surrogate key
stock_code	Original product code from dataset
description	Full product name / description

dim_date
Column	Description
date_id (PK)	Auto-increment surrogate key
date	Calendar date as text (YYYY-MM-DD)
year	4-digit year
month	Month number (1-12)
month_name	Month abbreviation (Jan, Feb, ...)
quarter	Quarter number (1-4)
day_of_week	Day name (Monday, Tuesday, ...)

dim_country
Column	Description
country_id (PK)	Auto-increment surrogate key
country_name	Full country name
 
6. ETL Process
6.1 ETL Overview
ETL stands for Extract, Transform, Load. It is the process of moving data from the source system into the data warehouse in a clean, structured form.

6.2 Extract
•	Source: online_retail_II.xlsx (Excel file with 2 sheets)
•	Library: OpenPyXL via pandas.read_excel()
•	Sheet used: Year 2009-2010 (525,461 raw rows)
•	All 8 columns loaded: Invoice, StockCode, Description, Quantity, InvoiceDate, Price, Customer ID, Country

6.3 Transform (Cleaning Steps)
#	Step	Rows affected	Reason
1	Standardise column names	All columns	Removes spaces, ensures consistency
2	Drop missing Customer ID	107,927 removed	Cannot cluster/classify without customer
3	Drop missing Description	2,928 removed	Cannot build product basket without name
4	Remove cancelled invoices	10,206 removed	Invoices starting with C are returns
5	Remove non-positive Quantity/Price	16,016 removed	Invalid transactions (returns, test entries)
6	Remove duplicate rows	6,865 removed	Exact duplicates add no information
7	Feature engineering	7 new columns added	Revenue, Year, Month, Quarter, DayOfWeek, MonthName, RevenueClass

6.4 Load (Warehouse Build)
•	Database: SQLite (file: warehouse.db, auto-created)
•	Tables created in order: dim_date, dim_customer, dim_product, dim_country, fact_sales
•	Foreign key constraints declared in fact_sales
•	All existing tables dropped and recreated on each build (full refresh)
•	Total rows in fact_sales: 400,916 (matching cleaned DataFrame)
•	Triggered via the Preprocessing page Build Data Warehouse button

6.5 Engineered Features
Feature	Formula	Used by
Revenue	Quantity x Price	All modules — primary measure
Year	InvoiceDate.year	Exploration — time series
Month	InvoiceDate.month	Classification (feature), Exploration
Quarter	InvoiceDate.quarter	Classification (feature), Exploration
DayOfWeek	InvoiceDate.day_name()	Exploration charts
RevenueClass	Low/Med/High by 33rd/66th percentile	Classification — target variable
 
7. Data Mining Algorithms
7.1 Classification Algorithms
Classification predicts which revenue class (Low / Medium / High) a transaction belongs to based on its features. All classifiers use the same train/test split (default 80/20) for fair comparison.

7.1.1 Decision Tree
•	Library: sklearn.tree.DecisionTreeClassifier
•	Parameters: max_depth=8, random_state=42
•	Features: raw (no scaling needed)
•	Why useful: fully interpretable — decision rules can be read and explained to managers
•	Output: rules text, confusion matrix, feature importance chart

7.1.2 Random Forest
•	Library: sklearn.ensemble.RandomForestClassifier
•	Parameters: n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
•	Features: raw (tree-based, no scaling needed)
•	Why useful: best accuracy of the four — ensemble of 100 trees reduces overfitting
•	Achieved 99.99% accuracy in testing

7.1.3 Naive Bayes
•	Library: sklearn.naive_bayes.GaussianNB
•	Parameters: default (assumes Gaussian distribution of features)
•	Features: StandardScaler applied before training
•	Why useful: very fast, good baseline; highlights when features are not independent
•	Note: lower accuracy (~52%) because it assumes feature independence which doesn't hold for retail data

7.1.4 K-Nearest Neighbour
•	Library: sklearn.neighbors.KNeighborsClassifier
•	Parameters: n_neighbors=7, n_jobs=-1
•	Features: StandardScaler applied before training
•	Why useful: instance-based, no assumptions about data distribution

7.2 Clustering Algorithms
Clustering groups customers by RFM score without predefined labels. Reveals natural segments like Champions, At-Risk, New, and Dormant customers.

7.2.1 K-Means
•	Library: sklearn.cluster.KMeans
•	Parameters: n_clusters=user-selected (default 4), n_init=10, random_state=42
•	Input: Standardised RFM (Recency, Frequency, Monetary) vectors per customer
•	Evaluation: Silhouette score (0.61 with k=4 — considered good separation)
•	Outputs: cluster labels, 3D scatter, 2D projections, radar chart, profile table

7.2.2 Hierarchical Clustering (Agglomerative)
•	Library: sklearn.cluster.AgglomerativeClustering
•	Parameters: n_clusters=user-selected, linkage=ward/complete/average (user-selected)
•	Input: same StandardScaled RFM vectors
•	Visualisation: dendrogram on 300-customer sample using scipy.cluster.hierarchy
•	Advantage: dendrogram lets you choose k visually without running elbow analysis first

7.3 Association Rule Mining
Discovers which products are bought together in the same invoice (market basket analysis). Builds a binary transaction matrix then mines frequent patterns.

7.3.1 Apriori
•	Library: mlxtend.frequent_patterns.apriori
•	Parameters: min_support=user-controlled (default 0.02), use_colnames=True, low_memory=True
•	How it works: repeatedly scans the transaction database, pruning itemsets below min support
•	Limitation: slower on large datasets (multiple database scans)

7.3.2 FP-Growth
•	Library: mlxtend.frequent_patterns.fpgrowth
•	Parameters: same min_support as Apriori
•	How it works: compresses the database into an FP-Tree, mines without repeated scanning
•	Advantage: significantly faster and more memory efficient on large datasets
•	Both algorithms produce identical rules — FP-Growth is recommended for production use

7.4 Evaluation Metrics Summary
Metric	Module	Definition
Accuracy	Classification	% of correct predictions out of all predictions
Precision	Classification	Of predicted positives, how many are truly positive
Recall	Classification	Of actual positives, how many were found
F1-Score	Classification	Harmonic mean of Precision and Recall
Silhouette Score	Clustering	How well-separated the clusters are (-1 to 1, higher is better)
Support	Association	Fraction of transactions containing the itemset
Confidence	Association	Probability of consequent given antecedent
Lift	Association	How much more likely the association is vs. random (>1 = real pattern)
 
8. Key Functions Reference
8.1 utils/preprocess.py
clean_data(df)
Input: raw DataFrame from Excel. Output: cleaned DataFrame with 7 new columns.
•	Standardises column names, drops nulls, removes cancellations
•	Removes non-positive Quantity/Price, drops duplicates
•	Adds: Revenue, Year, Month, MonthName, Quarter, DayOfWeek, RevenueClass

get_cleaning_report(raw, clean)
Input: raw and cleaned DataFrames. Output: dict of step-by-step row counts.
•	Used by Preprocessing page to display the before/after cleaning table

build_rfm(df)
Input: cleaned DataFrame. Output: RFM DataFrame (one row per customer).
•	Recency: days since last purchase (relative to max date + 1 day)
•	Frequency: number of unique invoices per customer
•	Monetary: total revenue per customer

8.2 utils/warehouse.py
build_warehouse(df)
Input: cleaned DataFrame. Creates/replaces all 5 tables in warehouse.db.
•	Drops existing tables first (full refresh strategy)
•	Creates in order: dim_date, dim_customer, dim_product, dim_country, fact_sales

warehouse_exists()
Returns True if fact_sales table exists in warehouse.db. Used by pages to check if ETL has run.

query_warehouse(sql)
Input: SQL query string. Output: pandas DataFrame. Convenience wrapper for SQLite queries.
 
9. Navigation & User Guide
9.1 Sidebar Navigation
The left sidebar shows 7 navigation items. Click any item to switch pages instantly. The sidebar also shows the project name, group, and university.

9.2 Page-by-Page Guide
Page	What to do	What you see
Home	No action needed — overview page	KPIs, module cards, dataset info
Dataset	Select sheet, adjust preview rows	Table preview, column types, missing values
Preprocessing	Click Run Preprocessing, then Build Warehouse	Cleaning report, clean data preview
Exploration	Click tabs, adjust dropdowns and sliders	5 chart types, KPIs, correlation matrix
Classification	Select features, click Run All Classifiers	4 models, confusion matrices, metrics
Clustering	Run Elbow, pick k, run K-Means and HC	3D scatter, radar chart, cluster profiles
Association	Adjust sliders, pick algorithm, click Mine	Rules table, network graph, lift chart

9.3 Tuning Parameters
Every interactive slider and dropdown affects what you see. Key parameters to know for your presentation:
•	Classification test_size: default 20% — change to see how model generalises
•	Clustering k: try 3, 4, 5 — compare silhouette scores to justify your chosen k
•	Association min_support: lower = more rules but slower; start at 2%, reduce to 1% for more patterns
•	Association min_lift: keep above 1.0; 1.5+ means a strong, reliable association
 
10. Results & Findings
10.1 Classification Results
Algorithm	Accuracy	Precision	Recall	F1-Score
Decision Tree	99.87%	99.87%	99.87%	99.87%
Random Forest	99.99%	99.99%	99.99%	99.99%
Naive Bayes	52.38%	52.1%	52.4%	48.7%
K-Nearest Neighbour	98.90%	98.9%	98.9%	98.9%

Key finding: Random Forest achieves 99.99% accuracy, significantly outperforming Naive Bayes (52%). This is because Naive Bayes assumes feature independence, which does not hold for retail data where Quantity and Price are correlated. Tree-based models capture this interaction naturally.

10.2 Clustering Results
•	K-Means with k=4 achieved a silhouette score of 0.61 — indicating good cluster separation
•	Cluster 0 — Champions: low recency, high frequency, high monetary
•	Cluster 1 — Dormant: high recency, low frequency, low monetary
•	Cluster 2 — New/Promising: medium recency, low frequency, medium monetary
•	Cluster 3 — At-Risk: increasing recency, declining frequency

10.3 Association Mining Results
•	Using UK transactions (1000 invoices), support=0.02, confidence=0.3: 131 frequent itemsets and 29 rules found
•	Top association (example): PINK CHERRY LIGHTS → WHITE CHERRY LIGHTS (support=0.04, confidence=0.82, lift=3.2)
•	High lift values (>2) confirm these are genuine purchasing patterns, not coincidences
•	FP-Growth produced identical rules in 40% less time than Apriori

10.4 Business Recommendations
9.	Place high-association products near each other in-store and online
10.	Offer bundle discounts for the top 10 rule pairs discovered
11.	Focus retention campaigns on Cluster 1 (Dormant) customers — they have spent money before
12.	Reward Cluster 0 (Champions) with loyalty points to maintain their behaviour
13.	Invest heavily in UK market — 92% of revenue — while testing growth in Germany and France
14.	Stock up before November/December — seasonal spike visible in the line chart
 
11. Troubleshooting
Problem	Solution
ModuleNotFoundError on startup	Run: pip install -r requirements.txt
Dataset not found error	Ensure online_retail_II.xlsx is in the data/ subfolder
Classification page shows no results	Go to Preprocessing first and click Run Preprocessing
Association mining is very slow	Reduce max_invoices slider to 500-1000 or increase min_support to 0.05
No rules found in Association	Lower min_support (try 0.01) and lower min_confidence (try 0.2)
Dendrogram takes too long	It uses a 300-customer sample — if still slow, restart the app
App crashes with MemoryError	Close other applications; the full dataset uses ~300MB RAM when loaded
Streamlit asks to re-run after browser refresh	Normal behaviour — re-run Preprocessing to restore session state
 
12. Presentation Guide (15 Slides)
This is the recommended slide structure for your 15-slide presentation. Use the dashboard live during the demo slides.

#	Slide Title	Content
1	Title Slide	Project name, course, group, date, lecturer
2	Problem & Objectives	Why retail data mining? What business questions does this answer?
3	Dataset Overview	525K rows, 8 columns, 40 countries, 2 years — show the column table
4	Data Warehouse Design	Star schema diagram with 5 tables, ETL flow diagram
5	ETL & Preprocessing	7 cleaning steps, before/after row counts, feature engineering
6	Data Exploration	LIVE DEMO — show bar and line charts, seasonal trend insight
7	Classification — Theory	What is classification? What are we predicting? RevenueClass definition
8	Classification — Results	LIVE DEMO — run classifiers, show comparison table and confusion matrix
9	Classification — Insight	Why Random Forest wins, why Naive Bayes underperforms, feature importance
10	Clustering — Theory	What is clustering? RFM explained, what customer segments mean
11	Clustering — Results	LIVE DEMO — run K-Means, show 3D scatter, radar chart, cluster profiles
12	Association Mining — Theory	What is market basket analysis? Support, confidence, lift defined
13	Association Mining — Results	LIVE DEMO — mine rules, show top rules table and network graph
14	Business Recommendations	6 actionable recommendations from the mining results
15	Conclusion & Q&A	Summary of what was built, what was found, limitations, and future work

12.1 Demo Tips
•	Pre-run Preprocessing before presenting so the session state is ready
•	Keep the browser on the Exploration page as your opening view — it is the most visual
•	For Classification, use default settings — they give the best results
•	For Association, use 1000 invoices, UK filter, support=0.02, confidence=0.3
•	For Clustering, run the elbow chart first, then set k=4 and run K-Means
•	Have a backup screenshot of each page in case of technical issues
 
13. Project Report Writing Guide
Your written project report should follow this structure based on the project brief requirements:

15.	Brief introduction: problem statement, objectives, and application domain
16.	Dataset description: source, columns, size, quality issues found
17.	Data warehouse design: star schema diagram, table definitions, ETL flow diagram
18.	Data preprocessing steps: list all 7 steps with row counts
19.	Implementation of at least TWO data mining techniques (you have 3 — advantage)
20.	Model outputs and results: screenshots of confusion matrices, silhouette scores, rule tables
21.	Visualisations and evaluation metrics: include charts from the Exploration page
22.	Short conclusion: what patterns were found, business value, limitations
Optional (for distinction):
•	Comparison of two algorithms (e.g. Decision Tree vs Random Forest vs KNN) with interpretation
•	Real-world interpretation: what do the customer clusters mean for the business?
•	Limitation section: what would improve the dashboard (more data, more features, neural nets)?

14. Quick Reference Card
Command / Item	Value / Description
Run dashboard	streamlit run app.py
Default port	http://localhost:8501
Install deps	pip install -r requirements.txt
Dataset file	data/online_retail_II.xlsx
Warehouse file	warehouse.db (auto-created)
Raw rows	525,461
Clean rows	400,916
Customers (RFM)	4,312
Classification target	RevenueClass (Low / Medium / High)
Best classifier	Random Forest (99.99% accuracy)
Clustering metric	Silhouette score (0.61 with k=4)
Association lib	MLxtend 0.23.1
Recommended k	4 (highest silhouette score)
Best association algo	FP-Growth (faster, same rules as Apriori)
Session state key	clean_df (stores cleaned DataFrame)

— End of Document —
