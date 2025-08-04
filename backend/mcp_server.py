"""
MCP Server with Data Quality Tools
"""
import asyncio
import json
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import plotly.graph_objects as go
import plotly.express as px
from io import BytesIO
import base64

logger = logging.getLogger(__name__)

class MCPServer:
    """FastMCP Server with Data Quality Tools"""
    
    def __init__(self):
        self.data_path: Optional[str] = None
        self.data: Optional[pd.DataFrame] = None
        self.tools = {}
        self._register_tools()
    
    async def initialize(self):
        """Initialize the MCP server"""
        logger.info("Initializing MCP Server with Data Quality Tools")
        
    async def set_data_path(self, file_path: str):
        """Set the data file path and load data"""
        self.data_path = file_path
        try:
            self.data = pd.read_csv(file_path)
            logger.info(f"Loaded data with shape: {self.data.shape}")
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def _register_tools(self):
        """Register all available tools"""
        self.tools = {
            "validate_data": {
                "description": "Validate data schema, types, and identify missing values",
                "function": self._validate_data,
                "parameters": {
                    "check_schema": {"type": "boolean", "default": True},
                    "check_missing": {"type": "boolean", "default": True},
                    "check_duplicates": {"type": "boolean", "default": True}
                }
            },
            "fix_data": {
                "description": "Clean and fix data issues",
                "function": self._fix_data,
                "parameters": {
                    "fix_missing": {"type": "boolean", "default": True},
                    "remove_duplicates": {"type": "boolean", "default": True},
                    "fix_types": {"type": "boolean", "default": True}
                }
            },
            "detect_anomalies": {
                "description": "Detect outliers and anomalies in campaign metrics",
                "function": self._detect_anomalies,
                "parameters": {
                    "columns": {"type": "list", "default": []},
                    "method": {"type": "string", "default": "isolation_forest"}
                }
            },
            "check_completeness": {
                "description": "Check data completeness and coverage",
                "function": self._check_completeness,
                "parameters": {
                    "required_columns": {"type": "list", "default": []},
                    "date_range": {"type": "dict", "default": {}}
                }
            },
            "get_insights": {
                "description": "Get data insights and answer analytical questions",
                "function": self._get_insights,
                "parameters": {
                    "query": {"type": "string", "required": True},
                    "visualization": {"type": "boolean", "default": False}
                }
            }
        }
    
    async def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools"""
        return [
            {
                "name": name,
                "description": tool["description"],
                "parameters": tool["parameters"]
            }
            for name, tool in self.tools.items()
        ]
    
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a specific tool"""
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")
        
        if self.data is None:
            raise ValueError("No data loaded. Please upload a CSV file first.")
        
        tool_function = self.tools[tool_name]["function"]
        try:
            result = await tool_function(**params)
            return {
                "tool": tool_name,
                "status": "success",
                "result": result
            }
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {str(e)}")
            return {
                "tool": tool_name,
                "status": "error",
                "error": str(e)
            }
    
    async def _validate_data(self, check_schema=True, check_missing=True, check_duplicates=True) -> Dict[str, Any]:
        """Validate data quality"""
        validation_results = {
            "summary": {
                "total_rows": len(self.data),
                "total_columns": len(self.data.columns),
                "data_types": {col: str(dtype) for col, dtype in self.data.dtypes.to_dict().items()}
            },
            "issues": []
        }
        
        if check_missing:
            missing_data = self.data.isnull().sum()
            missing_cols = missing_data[missing_data > 0]
            if not missing_cols.empty:
                validation_results["issues"].append({
                    "type": "missing_values",
                    "severity": "warning",
                    "details": {col: int(count) for col, count in missing_cols.to_dict().items()},
                    "description": f"Found missing values in {len(missing_cols)} columns"
                })
        
        if check_duplicates:
            duplicate_count = self.data.duplicated().sum()
            if duplicate_count > 0:
                validation_results["issues"].append({
                    "type": "duplicates",
                    "severity": "warning", 
                    "count": int(duplicate_count),
                    "description": f"Found {duplicate_count} duplicate rows"
                })
        
        if check_schema:
            # Check for expected marketing campaign columns
            expected_columns = ['campaign_name', 'date', 'impressions', 'clicks', 'cost']
            missing_expected = [col for col in expected_columns if col not in self.data.columns]
            if missing_expected:
                validation_results["issues"].append({
                    "type": "schema",
                    "severity": "error",
                    "missing_columns": missing_expected,
                    "description": f"Missing expected columns: {missing_expected}"
                })
        
        validation_results["status"] = "passed" if not validation_results["issues"] else "failed"
        return validation_results
    
    async def _fix_data(self, fix_missing=True, remove_duplicates=True, fix_types=True) -> Dict[str, Any]:
        """Fix data issues"""
        original_shape = self.data.shape
        fixes_applied = []
        
        if remove_duplicates:
            duplicate_count = self.data.duplicated().sum()
            if duplicate_count > 0:
                self.data = self.data.drop_duplicates()
                fixes_applied.append({
                    "type": "duplicates_removed",
                    "count": int(duplicate_count),
                    "description": f"Removed {duplicate_count} duplicate rows"
                })
        
        if fix_missing:
            # Fill missing numeric values with median
            numeric_cols = self.data.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if self.data[col].isnull().any():
                    median_val = self.data[col].median()
                    missing_count = self.data[col].isnull().sum()
                    self.data[col].fillna(median_val, inplace=True)
                    fixes_applied.append({
                        "type": "missing_values_filled",
                        "column": col,
                        "count": int(missing_count),
                        "method": "median",
                        "value": float(median_val),
                        "description": f"Filled {missing_count} missing values in {col} with median value {median_val}"
                    })
            
            # Fill missing categorical values with mode
            categorical_cols = self.data.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                if self.data[col].isnull().any():
                    mode_val = self.data[col].mode()[0] if not self.data[col].mode().empty else "Unknown"
                    missing_count = self.data[col].isnull().sum()
                    self.data[col].fillna(mode_val, inplace=True)
                    fixes_applied.append({
                        "type": "missing_values_filled",
                        "column": col,
                        "count": int(missing_count),
                        "method": "mode",
                        "value": mode_val,
                        "description": f"Filled {missing_count} missing values in {col} with mode value '{mode_val}'"
                    })
        
        if fix_types:
            # Try to convert date columns
            for col in self.data.columns:
                if 'date' in col.lower():
                    try:
                        self.data[col] = pd.to_datetime(self.data[col])
                        fixes_applied.append({
                            "type": "type_conversion",
                            "column": col,
                            "new_type": "datetime",
                            "description": f"Converted {col} to datetime"
                        })
                    except:
                        pass
        
        return {
            "status": "success",
            "original_shape": original_shape,
            "new_shape": self.data.shape,
            "fixes_applied": fixes_applied,
            "rows_affected": original_shape[0] - self.data.shape[0]
        }
    
    async def _detect_anomalies(self, columns=None, method="isolation_forest") -> Dict[str, Any]:
        """Detect anomalies in the data"""
        if columns is None or len(columns) == 0:
            # Use numeric columns by default
            columns = list(self.data.select_dtypes(include=[np.number]).columns)
        
        if not columns:
            return {"status": "error", "message": "No numeric columns found for anomaly detection"}
        
        # Prepare data for anomaly detection
        data_subset = self.data[columns].dropna()
        
        if len(data_subset) == 0:
            return {"status": "error", "message": "No valid data for anomaly detection"}
        
        anomalies = []
        
        if method == "isolation_forest":
            # Use Isolation Forest for anomaly detection
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(data_subset)
            
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            outlier_labels = iso_forest.fit_predict(scaled_data)
            scores = iso_forest.score_samples(scaled_data)
            
            # Convert scores to confidence percentages (higher score = less anomalous)
            confidence_scores = ((scores - scores.min()) / (scores.max() - scores.min()) * 100)
            
            outlier_indices = data_subset.index[outlier_labels == -1]
            
            for idx in outlier_indices:
                original_idx = data_subset.index.get_loc(idx)
                confidence = 100 - confidence_scores[original_idx]  # Invert for anomaly confidence
                
                anomaly_data = {
                    "row_index": int(idx),
                    "confidence_score": f"{confidence:.1f}%",
                    "raw_confidence": float(confidence),
                    "values": {},
                    "description": f"Anomaly detected with {confidence:.1f}% confidence"
                }
                
                # Add the actual values for this row
                for col in columns:
                    anomaly_data["values"][col] = float(self.data.loc[idx, col]) if pd.notnull(self.data.loc[idx, col]) else None
                
                anomalies.append(anomaly_data)
        
        # Sort by confidence score (highest first)
        anomalies.sort(key=lambda x: x["raw_confidence"], reverse=True)
        
        return {
            "status": "success",
            "method": method,
            "columns_analyzed": columns,
            "total_anomalies": len(anomalies),
            "anomalies": anomalies[:20],  # Return top 20 anomalies
            "summary": {
                "anomaly_rate": f"{len(anomalies) / len(data_subset) * 100:.2f}%",
                "total_rows_analyzed": len(data_subset)
            }
        }
    
    async def _check_completeness(self, required_columns=None, date_range=None) -> Dict[str, Any]:
        """Check data completeness"""
        completeness_results = {
            "overall_completeness": {},
            "column_completeness": {},
            "date_coverage": {},
            "issues": []
        }
        
        # Overall completeness
        total_cells = self.data.size
        non_null_cells = self.data.count().sum()
        overall_completeness = (non_null_cells / total_cells) * 100
        
        completeness_results["overall_completeness"] = {
            "percentage": f"{overall_completeness:.2f}%",
            "total_cells": total_cells,
            "non_null_cells": int(non_null_cells)
        }
        
        # Column-wise completeness
        for col in self.data.columns:
            col_completeness = (self.data[col].count() / len(self.data)) * 100
            completeness_results["column_completeness"][col] = {
                "percentage": f"{col_completeness:.2f}%",
                "missing_count": int(self.data[col].isnull().sum()),
                "total_count": len(self.data)
            }
            
            if col_completeness < 80:  # Flag columns with less than 80% completeness
                completeness_results["issues"].append({
                    "type": "low_completeness",
                    "column": col,
                    "completeness": f"{col_completeness:.2f}%",
                    "severity": "warning" if col_completeness >= 50 else "error"
                })
        
        # Check required columns
        if required_columns:
            missing_required = [col for col in required_columns if col not in self.data.columns]
            if missing_required:
                completeness_results["issues"].append({
                    "type": "missing_required_columns",
                    "columns": missing_required,
                    "severity": "error"
                })
        
        # Date coverage analysis
        date_columns = [col for col in self.data.columns if 'date' in col.lower()]
        if date_columns:
            for date_col in date_columns:
                try:
                    dates = pd.to_datetime(self.data[date_col], errors='coerce')
                    valid_dates = dates.dropna()
                    if not valid_dates.empty:
                        completeness_results["date_coverage"][date_col] = {
                            "start_date": valid_dates.min().strftime('%Y-%m-%d'),
                            "end_date": valid_dates.max().strftime('%Y-%m-%d'),
                            "total_days": (valid_dates.max() - valid_dates.min()).days + 1,
                            "unique_dates": len(valid_dates.unique()),
                            "coverage_percentage": f"{len(valid_dates.unique()) / ((valid_dates.max() - valid_dates.min()).days + 1) * 100:.2f}%"
                        }
                except:
                    pass
        
        return completeness_results
    
    async def _get_insights(self, query: str, visualization: bool = False) -> Dict[str, Any]:
        """Get data insights based on natural language query"""
        query_lower = query.lower()
        
        # Query routing based on keywords
        if "campaign" in query_lower and "list" in query_lower:
            return await self._list_campaigns()
        elif "impression" in query_lower and ("most" in query_lower or "highest" in query_lower):
            return await self._top_campaigns_by_metric("impressions", visualization)
        elif "click" in query_lower and ("most" in query_lower or "highest" in query_lower):
            return await self._top_campaigns_by_metric("clicks", visualization)
        elif "cost" in query_lower and ("most" in query_lower or "highest" in query_lower):
            return await self._top_campaigns_by_metric("cost", visualization)
        elif "trend" in query_lower or "over time" in query_lower:
            return await self._get_trends(visualization)
        elif "summary" in query_lower or "overview" in query_lower:
            return await self._get_summary()
        else:
            return await self._general_insights(query)
    
    async def _list_campaigns(self) -> Dict[str, Any]:
        """List all campaign names"""
        campaign_cols = [col for col in self.data.columns if 'campaign' in col.lower()]
        if not campaign_cols:
            return {"status": "error", "message": "No campaign column found"}
        
        campaign_col = campaign_cols[0]
        campaigns = self.data[campaign_col].dropna().unique().tolist()
        
        return {
            "status": "success",
            "query_type": "campaign_list",
            "total_campaigns": len(campaigns),
            "campaigns": campaigns
        }
    
    async def _top_campaigns_by_metric(self, metric: str, visualization: bool = False) -> Dict[str, Any]:
        """Get top campaigns by a specific metric"""
        if metric not in self.data.columns:
            return {"status": "error", "message": f"Metric '{metric}' not found in data"}
        
        campaign_cols = [col for col in self.data.columns if 'campaign' in col.lower()]
        if not campaign_cols:
            return {"status": "error", "message": "No campaign column found"}
        
        campaign_col = campaign_cols[0]
        
        # Group by campaign and sum the metric
        campaign_metrics = self.data.groupby(campaign_col)[metric].sum().sort_values(ascending=False)
        
        top_campaigns = []
        for campaign, value in campaign_metrics.head(10).items():
            top_campaigns.append({
                "campaign": campaign,
                "value": float(value),
                "metric": metric
            })
        
        result = {
            "status": "success",
            "query_type": f"top_campaigns_by_{metric}",
            "metric": metric,
            "top_campaigns": top_campaigns
        }
        
        if visualization:
            # Create a simple bar chart data
            result["chart_data"] = {
                "type": "bar",
                "x": [item["campaign"] for item in top_campaigns],
                "y": [item["value"] for item in top_campaigns],
                "title": f"Top Campaigns by {metric.title()}"
            }
        
        return result
    
    async def _get_trends(self, visualization: bool = False) -> Dict[str, Any]:
        """Get time-series trends"""
        date_cols = [col for col in self.data.columns if 'date' in col.lower()]
        if not date_cols:
            return {"status": "error", "message": "No date column found"}
        
        date_col = date_cols[0]
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns.tolist()
        
        try:
            self.data[date_col] = pd.to_datetime(self.data[date_col])
            daily_trends = self.data.groupby(self.data[date_col].dt.date)[numeric_cols].sum()
            
            trends = {}
            for col in numeric_cols:
                trends[col] = {
                    "dates": [str(date) for date in daily_trends.index],
                    "values": daily_trends[col].tolist()
                }
            
            result = {
                "status": "success",
                "query_type": "trends",
                "date_range": {
                    "start": str(daily_trends.index.min()),
                    "end": str(daily_trends.index.max())
                },
                "trends": trends
            }
            
            if visualization and 'impressions' in numeric_cols:
                result["chart_data"] = {
                    "type": "line",
                    "x": trends['impressions']["dates"],
                    "y": trends['impressions']["values"],
                    "title": "Impressions Over Time"
                }
            
            return result
            
        except Exception as e:
            return {"status": "error", "message": f"Error analyzing trends: {str(e)}"}
    
    async def _get_summary(self) -> Dict[str, Any]:
        """Get data summary"""
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns
        
        summary = {
            "total_rows": len(self.data),
            "date_range": {},
            "metrics_summary": {}
        }
        
        # Date range
        date_cols = [col for col in self.data.columns if 'date' in col.lower()]
        if date_cols:
            try:
                date_col = date_cols[0]
                dates = pd.to_datetime(self.data[date_col], errors='coerce').dropna()
                summary["date_range"] = {
                    "start": dates.min().strftime('%Y-%m-%d'),
                    "end": dates.max().strftime('%Y-%m-%d'),
                    "total_days": (dates.max() - dates.min()).days + 1
                }
            except:
                pass
        
        # Metrics summary
        for col in numeric_cols:
            summary["metrics_summary"][col] = {
                "total": float(self.data[col].sum()),
                "average": float(self.data[col].mean()),
                "min": float(self.data[col].min()),
                "max": float(self.data[col].max())
            }
        
        return {
            "status": "success",
            "query_type": "summary",
            "summary": summary
        }
    
    async def _general_insights(self, query: str) -> Dict[str, Any]:
        """Handle general insights queries"""
        return {
            "status": "partial",
            "message": f"Query: '{query}' requires more specific analysis. Try asking about campaigns, trends, or specific metrics.",
            "suggestions": [
                "List all campaigns",
                "Which campaign had the most impressions?",
                "Show trends over time",
                "Get data summary"
            ]
        }