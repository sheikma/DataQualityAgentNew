# Marketing Campaign Data Quality Agent

An end-to-end AI-powered solution for validating, fixing, and detecting anomalies in marketing campaign data with a conversational interface.

## 🚀 Features

### 🧠 AI-Powered Analysis
- **Claude AI Integration**: Natural language understanding for query routing
- **Intelligent Tool Selection**: Automatically chooses the right analysis tools
- **Conversational Interface**: Chat with your data using plain English

### 🔧 Data Quality Tools
- **Data Validation**: Schema conformity, missing values, duplicate detection
- **Data Fixing**: Automated cleaning and imputation with preview
- **Anomaly Detection**: Statistical outlier detection with confidence scores (e.g., "92% confidence this is an outlier")
- **Data Completeness**: Field and time range validation
- **Data Insights**: Natural language querying and aggregations

### 🎨 Modern Frontend
- **Rich Chat UI**: Professional, responsive React interface
- **Interactive Tables**: Sortable, searchable data tables with export
- **Time-Series Charts**: Dynamic visualizations using Chart.js
- **Quick Actions**: One-click buttons for common operations
- **Real-time Updates**: Live status indicators and progress feedback

### 🔄 Human-in-the-Loop
- **Fix Previews**: See changes before applying them
- **Confidence Scores**: Understand why anomalies are flagged
- **Customizable Actions**: Choose which fixes to apply

## 📁 Project Structure

```
DataQualityAgentNew/
├── backend/                    # FastMCP Python server
│   ├── main.py                # FastAPI application entry point
│   ├── mcp_server.py          # MCP tools implementation
│   ├── ai_agent.py            # Claude AI integration
│   ├── config.py              # Configuration settings
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React.js application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service layer
│   │   ├── App.js            # Main application component
│   │   └── index.js          # React entry point
│   ├── public/               # Static assets
│   └── package.json          # Node.js dependencies
├── sample_data/              # Test data
│   └── marketing_campaigns.csv
├── start_backend.bat         # Windows backend startup
├── start_frontend.bat        # Windows frontend startup
└── README.md                 # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** (for cloning)

### Quick Start (Windows)

1. **Clone the repository**
```bash
git clone <repository-url>
cd DataQualityAgentNew
```

2. **Start Backend** (Double-click `start_backend.bat` or run in terminal)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

3. **Start Frontend** (Double-click `start_frontend.bat` or run in new terminal)
```bash
cd frontend
npm install
npm start
```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend will start on http://localhost:8000

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will start on http://localhost:3000

## 📊 Sample Data

The project includes sample marketing campaign data (`sample_data/marketing_campaigns.csv`) with:
- Campaign names and dates
- Metrics: impressions, clicks, cost, conversions
- Calculated fields: CTR, CPC, conversion rate
- Intentional data quality issues for demonstration

## 💬 Usage Examples

### Getting Started
1. **Load Data**: Enter the file path `/c:/Project/AIEngg/DataQualityAgentNew/sample_data/marketing_campaigns.csv`
2. **Ask Questions**: Use natural language queries

### Example Queries
- **Data Validation**: "Check my data quality"
- **Anomaly Detection**: "Find any unusual patterns in my campaign data"
- **Data Insights**: "Which campaign had the most impressions last week?"
- **Trend Analysis**: "Show me trends over time"
- **Campaign Analysis**: "List all campaign names"
- **Performance**: "Which campaigns performed best?"

### Interactive Features
- Click **Quick Action** buttons for common tasks
- Export tables to CSV
- Download charts as PNG
- Sort and search data tables
- View confidence scores for anomalies

## 🔧 Technical Architecture

### Backend Components
- **FastAPI**: RESTful API server
- **FastMCP**: Model Control Protocol implementation
- **Claude API**: Natural language processing
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning for anomaly detection
- **Plotly/Matplotlib**: Data visualization

### Frontend Components
- **React 18**: Modern frontend framework
- **Styled Components**: CSS-in-JS styling
- **Chart.js**: Interactive data visualization
- **Framer Motion**: Smooth animations
- **Axios**: HTTP client for API communication

### AI Integration
- **Claude Sonnet**: Query understanding and tool routing
- **Prompt Engineering**: Optimized prompts for accurate tool selection
- **Context Awareness**: Maintains conversation context

## 🎯 Workflow

```
User Query → Claude AI → Tool Selection → MCP Server → Data Processing → Results → UI Components
```

1. **User Input**: Natural language query in chat
2. **AI Analysis**: Claude determines intent and selects tools
3. **Tool Execution**: MCP server runs appropriate data quality tools
4. **Result Processing**: Format results for UI display
5. **Response Generation**: Claude creates human-friendly explanations
6. **UI Rendering**: Display tables, charts, and action buttons

## 🚨 Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change port in `config.py`
- **Missing dependencies**: Run `pip install -r requirements.txt`
- **Claude API errors**: Check API key in `config.py`

### Frontend Issues
- **Port 3000 in use**: React will prompt to use different port
- **Module not found**: Run `npm install` in frontend directory
- **API connection**: Ensure backend is running on localhost:8000

### Data Issues
- **File not found**: Use absolute path to CSV file
- **CSV format**: Ensure headers match expected schema
- **Large files**: May require chunking for processing

## 🔮 Future Enhancements

- **Multiple File Formats**: Excel, JSON, Parquet support
- **Cloud Integration**: AWS S3, Google Cloud Storage
- **Advanced ML**: Deep learning anomaly detection
- **Scheduling**: Automated data quality monitoring
- **Notifications**: Email/Slack alerts for issues
- **Multi-user**: Team collaboration features

## 📝 API Documentation

When the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints
- `POST /chat` - Main chat interface
- `POST /upload-data` - Set data file path
- `GET /tools` - List available tools
- `POST /tool/{tool_name}` - Execute specific tool
- `GET /health` - Health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.