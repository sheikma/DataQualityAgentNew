# Marketing Campaign Data Quality Agent - Demo Guide

## 🎯 Demo Overview

This demo showcases the complete end-to-end workflow of the AI-powered Marketing Campaign Data Quality Agent.

## 🚀 Quick Demo Steps

### 1. Start the Application

**Option A: Use the batch files (Windows)**
1. Double-click `start_backend.bat` 
2. Double-click `start_frontend.bat`

**Option B: Manual startup**
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

### 2. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

### 3. Load Sample Data
1. In the sidebar, enter the file path:
   ```
   /c:/Project/AIEngg/DataQualityAgentNew/sample_data/marketing_campaigns.csv
   ```
2. Click "Load Data"
3. Wait for confirmation message

### 4. Demo Conversation Flow

#### **Scene 1: Data Validation**
**User**: "Check my data quality"

**Expected Response**: 
- Summary of data validation results
- Table showing any missing values or duplicates
- Quick action buttons for fixing issues

#### **Scene 2: Anomaly Detection**
**User**: "Find any unusual patterns in my campaign data"

**Expected Response**:
- Table of detected anomalies with confidence scores
- Explanation of why each anomaly was flagged
- "Fix Detected Anomalies" button

#### **Scene 3: Data Insights**
**User**: "Which campaign had the most impressions?"

**Expected Response**:
- Table ranking campaigns by impressions
- Specific answer highlighting the top performer
- Optional: Bar chart visualization

#### **Scene 4: Trend Analysis**
**User**: "Show me trends over time"

**Expected Response**:
- Time-series chart of key metrics
- Trend analysis and insights
- Interactive chart with download option

#### **Scene 5: Fix Data Issues**
**User**: "Fix the data quality issues"

**Expected Response**:
- Preview of proposed fixes
- Summary of changes to be made
- Confirmation of fixes applied

## 🎨 Key Features to Highlight

### 1. **Conversational AI Interface**
- Natural language understanding
- Context-aware responses
- Intelligent tool routing

### 2. **Rich Data Visualizations**
- Interactive tables with sorting/searching
- Dynamic charts with Chart.js
- Export capabilities (CSV, PNG)

### 3. **Anomaly Detection with Confidence**
- Machine learning-powered detection
- Confidence scores (e.g., "92% confidence")
- Clear explanations of why anomalies are flagged

### 4. **Human-in-the-Loop Workflow**
- Preview before applying changes
- Selective fix application
- Transparent process explanation

### 5. **Modern UI/UX**
- Professional chat interface
- Real-time status indicators
- Smooth animations and transitions
- Quick action buttons

## 📊 Sample Data Features

The included sample data (`marketing_campaigns.csv`) contains:
- **50 campaigns** with realistic names
- **Date range**: January-March 2024
- **Metrics**: impressions, clicks, cost, conversions, CTR, CPC, conversion_rate
- **Intentional issues**: Missing values, outliers for demonstration

### Data Quality Issues Included:
1. **Missing Values**: Some clicks and CPC values are missing
2. **Outliers**: "Trending Now" campaign has unusually high metrics
3. **Data Types**: Date columns may need conversion
4. **Duplicates**: None in this dataset, but tool can detect them

## 🎬 Demo Script

### Opening (30 seconds)
"Welcome to the Marketing Campaign Data Quality Agent. This AI-powered tool helps marketing teams validate, analyze, and fix issues in their campaign data through a simple chat interface."

### Data Loading (30 seconds)
"First, I'll load our sample marketing campaign data. Notice how the interface provides real-time feedback and status updates."

### Validation Demo (60 seconds)
"Let me check the data quality by asking 'Check my data quality'. See how the AI automatically runs validation tools and presents results in an interactive table with clear issue descriptions."

### Anomaly Detection (60 seconds)
"Now I'll ask 'Find any unusual patterns'. The system uses machine learning to detect outliers and provides confidence scores. Notice the 'Trending Now' campaign is flagged with high confidence."

### Insights & Analytics (60 seconds)
"I can ask analytical questions like 'Which campaign had the most impressions?' The AI understands the query, analyzes the data, and presents results both textually and visually."

### Data Fixing (60 seconds)
"Finally, I'll say 'Fix the data quality issues'. The system proposes fixes, shows a preview, and applies changes only after confirmation. This human-in-the-loop approach ensures data safety."

### Closing (30 seconds)
"The Marketing Campaign Data Quality Agent provides enterprise-grade data quality analysis through an intuitive conversational interface, making data quality accessible to marketing teams without technical expertise."

## 🔧 Troubleshooting Demo Issues

### If Backend Won't Start:
1. Check Python version (3.8+ required)
2. Install dependencies: `pip install -r requirements.txt`
3. Check if port 8000 is available

### If Frontend Won't Start:
1. Check Node.js version (16+ required)
2. Install dependencies: `npm install`
3. Clear cache: `npm start -- --reset-cache`

### If Data Won't Load:
1. Use absolute file path
2. Check file exists at specified location
3. Verify CSV format with headers

### If Claude API Fails:
1. Check API key in `backend/config.py`
2. Verify internet connection
3. Check API rate limits

## 📈 Demo Metrics to Highlight

- **Response Time**: Sub-second query processing
- **Accuracy**: High confidence anomaly detection
- **Usability**: Zero technical knowledge required
- **Flexibility**: Natural language queries
- **Safety**: Human-in-the-loop confirmations
- **Scalability**: Handles large datasets efficiently

## 🎯 Target Audience Benefits

### For Marketing Teams:
- No SQL or technical skills required
- Instant data quality insights
- Proactive anomaly detection
- Campaign performance analysis

### For Data Teams:
- Automated data validation
- Reduced manual QA time
- Standardized quality checks
- Audit trail of all changes

### For Management:
- Data quality transparency
- Risk mitigation
- Improved decision making
- ROI through error prevention

---

**Demo Duration**: 5-7 minutes
**Setup Time**: 2-3 minutes
**Total Time**: 8-10 minutes