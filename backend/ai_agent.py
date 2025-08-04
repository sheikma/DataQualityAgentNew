"""
AI Agent for Data Quality with Claude Integration
"""
import asyncio
import json
import logging
import os
from typing import Any, Dict, List, Optional
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class DataQualityAgent:
    """AI Agent that routes queries to appropriate MCP tools using Claude"""
    
    def __init__(self, mcp_server):
        self.mcp_server = mcp_server
        self.claude_api_key = "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"
        self.client = Anthropic(api_key=self.claude_api_key)
        
        # Tool routing prompts
        self.tool_descriptions = {
            "validate_data": "Use for checking data quality, schema validation, missing values, duplicates",
            "fix_data": "Use for cleaning data, fixing missing values, removing duplicates",
            "detect_anomalies": "Use for finding outliers, unusual patterns, statistical anomalies",
            "check_completeness": "Use for checking data coverage, missing time periods, required fields",
            "get_insights": "Use for analytical questions, trends, comparisons, summaries"
        }
    
    async def process_query(self, user_query: str) -> Dict[str, Any]:
        """Process user query and route to appropriate tools"""
        try:
            # Step 1: Analyze query and determine tools to use
            tools_to_use = await self._analyze_query(user_query)
            
            # Step 2: Execute tools
            tool_results = []
            for tool_config in tools_to_use:
                tool_name = tool_config["tool"]
                params = tool_config.get("params", {})
                
                result = await self.mcp_server.execute_tool(tool_name, params)
                tool_results.append({
                    "tool": tool_name,
                    "result": result
                })
            
            # Step 3: Generate response using Claude
            response = await self._generate_response(user_query, tool_results)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                "type": "error",
                "message": f"Sorry, I encountered an error: {str(e)}",
                "suggestions": [
                    "Try asking about data validation",
                    "Ask for anomaly detection",
                    "Request data insights"
                ]
            }
    
    async def _analyze_query(self, query: str) -> List[Dict[str, Any]]:
        """Analyze user query to determine which tools to use"""
        
        analysis_prompt = f"""
You are a data quality assistant. Analyze this user query and determine which tools to use:

Query: "{query}"

Available tools:
1. validate_data - Check data quality, schema, missing values, duplicates
2. fix_data - Clean data, fix missing values, remove duplicates  
3. detect_anomalies - Find outliers and unusual patterns
4. check_completeness - Check data coverage and completeness
5. get_insights - Answer analytical questions and provide insights

Rules:
- For questions about data problems/issues/quality: use validate_data
- For requests to fix/clean data: use fix_data
- For finding outliers/anomalies/unusual patterns: use detect_anomalies
- For checking coverage/completeness: use check_completeness
- For analytical questions (trends, comparisons, lists): use get_insights
- You can suggest multiple tools if needed
- If the query is unclear, default to validate_data

Respond with a JSON array of tools to use, each with "tool" and "params" fields:
[
  {{"tool": "tool_name", "params": {{"param1": "value1"}}}}
]

Only respond with valid JSON, no other text.
"""
        
        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[{"role": "user", "content": analysis_prompt}]
            )
            
            response_text = message.content[0].text.strip()
            
            # Parse JSON response
            tools_config = json.loads(response_text)
            
            return tools_config
            
        except Exception as e:
            logger.error(f"Error analyzing query: {str(e)}")
            # Fallback: basic keyword-based routing
            return self._fallback_routing(query)
    
    def _fallback_routing(self, query: str) -> List[Dict[str, Any]]:
        """Fallback routing based on keywords"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['fix', 'clean', 'repair']):
            return [{"tool": "fix_data", "params": {}}]
        elif any(word in query_lower for word in ['anomal', 'outlier', 'unusual', 'strange']):
            return [{"tool": "detect_anomalies", "params": {}}]
        elif any(word in query_lower for word in ['complete', 'coverage', 'missing']):
            return [{"tool": "check_completeness", "params": {}}]
        elif any(word in query_lower for word in ['trend', 'insight', 'campaign', 'most', 'best']):
            return [{"tool": "get_insights", "params": {"query": query, "visualization": True}}]
        else:
            return [{"tool": "validate_data", "params": {}}]
    
    async def _generate_response(self, original_query: str, tool_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate natural language response using Claude"""
        
        # Format tool results for Claude
        results_summary = []
        for result in tool_results:
            tool_name = result["tool"]
            tool_result = result["result"]["result"] if result["result"].get("status") == "success" else result["result"]
            results_summary.append(f"Tool: {tool_name}\nResult: {json.dumps(tool_result, indent=2)}")
        
        results_text = "\n\n".join(results_summary)
        
        response_prompt = f"""
You are a helpful data quality assistant. The user asked: "{original_query}"

I ran some data analysis tools and got these results:

{results_text}

Please provide a helpful, conversational response that:
1. Directly answers the user's question
2. Highlights key findings from the tool results
3. Uses a friendly, professional tone
4. Suggests actionable next steps if applicable
5. Formats any data in a clear, readable way

Guidelines:
- If there are anomalies, explain what they mean and their confidence scores
- If there are data quality issues, explain the impact and suggest fixes
- If showing insights, present them clearly with context
- Always be specific and reference actual numbers from the results
- Keep responses concise but informative

Respond in a natural, conversational way as if you're a data analyst explaining findings to a colleague.
"""
        
        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1500,
                messages=[{"role": "user", "content": response_prompt}]
            )
            
            ai_response = message.content[0].text.strip()
            
            # Structure the response
            response = {
                "type": "success",
                "message": ai_response,
                "tool_results": tool_results,
                "query": original_query
            }
            
            # Add specific UI components based on tool results
            response["components"] = self._generate_ui_components(tool_results)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            # Fallback: Generate response directly from tool results
            return self._generate_fallback_response(original_query, tool_results)
    
    def _generate_ui_components(self, tool_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate UI components based on tool results"""
        components = []
        
        for result in tool_results:
            tool_name = result["tool"]
            tool_data = result["result"]["result"] if result["result"].get("status") == "success" else {}
            
            if tool_name == "detect_anomalies" and "anomalies" in tool_data:
                # Table component for anomalies
                anomalies_table = {
                    "type": "table",
                    "title": "Detected Anomalies",
                    "headers": ["Row", "Confidence", "Description", "Values"],
                    "rows": []
                }
                
                for anomaly in tool_data["anomalies"][:10]:  # Top 10
                    values_str = ", ".join([f"{k}: {v}" for k, v in anomaly.get("values", {}).items()])
                    anomalies_table["rows"].append([
                        str(anomaly.get("row_index", "N/A")),
                        anomaly.get("confidence_score", "N/A"),
                        anomaly.get("description", "N/A"),
                        values_str
                    ])
                
                components.append(anomalies_table)
                
                # Action button for anomalies
                components.append({
                    "type": "button",
                    "text": "Fix Detected Anomalies",
                    "action": "fix_anomalies",
                    "style": "primary"
                })
            
            elif tool_name == "get_insights" and "chart_data" in tool_data:
                # Chart component
                chart_data = tool_data["chart_data"]
                components.append({
                    "type": "chart",
                    "chart_type": chart_data.get("type", "bar"),
                    "title": chart_data.get("title", "Data Visualization"),
                    "data": {
                        "x": chart_data.get("x", []),
                        "y": chart_data.get("y", [])
                    }
                })
            
            elif tool_name == "validate_data" and "issues" in tool_data:
                # Issues summary
                if tool_data["issues"]:
                    issues_table = {
                        "type": "table",
                        "title": "Data Quality Issues",
                        "headers": ["Type", "Severity", "Description"],
                        "rows": []
                    }
                    
                    for issue in tool_data["issues"]:
                        issues_table["rows"].append([
                            issue.get("type", "Unknown"),
                            issue.get("severity", "Unknown"),
                            issue.get("description", "No description")
                        ])
                    
                    components.append(issues_table)
                    
                    # Fix button if there are issues
                    components.append({
                        "type": "button",
                        "text": "Auto-Fix Issues",
                        "action": "fix_data",
                        "style": "success"
                    })
            
            elif tool_name == "get_insights" and "top_campaigns" in tool_data:
                # Top campaigns table
                campaigns_table = {
                    "type": "table",
                    "title": f"Top Campaigns by {tool_data.get('metric', 'Metric')}",
                    "headers": ["Campaign", "Value"],
                    "rows": []
                }
                
                for campaign in tool_data["top_campaigns"]:
                    campaigns_table["rows"].append([
                        campaign.get("campaign", "Unknown"),
                        str(campaign.get("value", 0))
                    ])
                
                components.append(campaigns_table)
        
        return components
    
    def _generate_fallback_response(self, original_query: str, tool_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate response directly from tool results when Claude API is unavailable"""
        
        # Extract results from successful tool executions
        successful_results = []
        for result in tool_results:
            if result.get("result", {}).get("status") == "success":
                successful_results.append(result)
        
        if not successful_results:
            return {
                "type": "error",
                "message": "I couldn't process your request. Please try again.",
                "tool_results": tool_results,
                "query": original_query
            }
        
        # Generate response based on tool type
        main_result = successful_results[0]
        tool_name = main_result["tool"]
        tool_data = main_result["result"]["result"]
        
        if tool_name == "validate_data":
            message = self._format_validation_response(tool_data)
        elif tool_name == "detect_anomalies":
            message = self._format_anomaly_response(tool_data)
        elif tool_name == "get_insights":
            message = self._format_insights_response(tool_data)
        elif tool_name == "check_completeness":
            message = self._format_completeness_response(tool_data)
        elif tool_name == "fix_data":
            message = self._format_fix_response(tool_data)
        else:
            message = "I've processed your request successfully. Please check the detailed results below."
        
        return {
            "type": "success",
            "message": message,
            "tool_results": tool_results,
            "query": original_query,
            "components": self._generate_ui_components(tool_results)
        }
    
    def _format_validation_response(self, data: Dict[str, Any]) -> str:
        """Format validation results into natural language"""
        summary = data.get("summary", {})
        issues = data.get("issues", [])
        
        response = f"I've analyzed your data quality for {summary.get('total_rows', 0)} rows and {summary.get('total_columns', 0)} columns.\n\n"
        
        if not issues:
            response += "✅ Great news! No data quality issues were found. Your data appears to be clean and ready for analysis."
        else:
            response += f"⚠️ Found {len(issues)} data quality issues:\n\n"
            for issue in issues:
                if issue["type"] == "missing_values":
                    details = issue.get("details", {})
                    missing_cols = ", ".join([f"{col} ({count} missing)" for col, count in details.items()])
                    response += f"• **Missing Values**: {missing_cols}\n"
                elif issue["type"] == "duplicates":
                    response += f"• **Duplicates**: {issue.get('count', 0)} duplicate rows found\n"
            
            response += "\n💡 I can help fix these issues. Just ask me to 'fix the data quality issues'."
        
        return response
    
    def _format_anomaly_response(self, data: Dict[str, Any]) -> str:
        """Format anomaly detection results"""
        anomalies = data.get("anomalies", [])
        total_anomalies = data.get("total_anomalies", 0)
        summary = data.get("summary", {})
        
        if total_anomalies == 0:
            return "✅ No anomalies detected in your data. All data points appear to be within normal ranges."
        
        response = f"🚨 Detected {total_anomalies} anomalies in your data (showing top {len(anomalies)}):\n\n"
        
        for i, anomaly in enumerate(anomalies[:5], 1):
            confidence = anomaly.get("confidence_score", "N/A")
            row_idx = anomaly.get("row_index", "N/A")
            response += f"{i}. **Row {row_idx}** - {confidence} confidence\n"
        
        anomaly_rate = summary.get("anomaly_rate", "N/A")
        response += f"\n📊 **Anomaly Rate**: {anomaly_rate} of your data\n"
        response += "\n💡 Review the detailed table below to investigate these anomalies further."
        
        return response
    
    def _format_insights_response(self, data: Dict[str, Any]) -> str:
        """Format insights results"""
        query_type = data.get("query_type", "")
        
        if query_type == "campaign_list":
            campaigns = data.get("campaigns", [])
            total = data.get("total_campaigns", 0)
            response = f"📋 Found {total} campaigns in your data:\n\n"
            for i, campaign in enumerate(campaigns[:10], 1):
                response += f"{i}. {campaign}\n"
            if total > 10:
                response += f"\n... and {total - 10} more campaigns."
        
        elif "top_campaigns" in query_type:
            top_campaigns = data.get("top_campaigns", [])
            metric = data.get("metric", "metric")
            
            if top_campaigns:
                best_campaign = top_campaigns[0]
                response = f"🏆 **Top performer**: {best_campaign['campaign']} with {best_campaign['value']:,.0f} {metric}\n\n"
                response += f"📊 **Top 5 campaigns by {metric}**:\n"
                for i, campaign in enumerate(top_campaigns[:5], 1):
                    response += f"{i}. {campaign['campaign']}: {campaign['value']:,.0f}\n"
            else:
                response = f"No campaign data found for {metric} analysis."
        
        elif query_type == "summary":
            summary_data = data.get("summary", {})
            response = f"📊 **Data Summary**:\n"
            response += f"• Total rows: {summary_data.get('total_rows', 0):,}\n"
            
            date_range = summary_data.get("date_range", {})
            if date_range:
                response += f"• Date range: {date_range.get('start')} to {date_range.get('end')}\n"
            
            metrics = summary_data.get("metrics_summary", {})
            if metrics:
                response += "\n**Key Metrics**:\n"
                for metric, values in metrics.items():
                    total = values.get("total", 0)
                    avg = values.get("average", 0)
                    response += f"• {metric.title()}: {total:,.0f} total, {avg:,.1f} average\n"
        
        else:
            response = "I've processed your request successfully. Please check the detailed results below."
        
        return response
    
    def _format_completeness_response(self, data: Dict[str, Any]) -> str:
        """Format completeness check results"""
        overall = data.get("overall_completeness", {})
        issues = data.get("issues", [])
        
        completeness_pct = overall.get("percentage", "N/A")
        response = f"📋 **Data Completeness**: {completeness_pct}\n\n"
        
        if not issues:
            response += "✅ Excellent! Your data is complete with no missing required fields or coverage gaps."
        else:
            response += f"⚠️ Found {len(issues)} completeness issues:\n\n"
            for issue in issues:
                if issue["type"] == "low_completeness":
                    col = issue.get("column", "Unknown")
                    completeness = issue.get("completeness", "N/A")
                    response += f"• **{col}**: Only {completeness} complete\n"
                elif issue["type"] == "missing_required_columns":
                    missing_cols = ", ".join(issue.get("columns", []))
                    response += f"• **Missing required columns**: {missing_cols}\n"
        
        return response
    
    def _format_fix_response(self, data: Dict[str, Any]) -> str:
        """Format data fixing results"""
        fixes = data.get("fixes_applied", [])
        rows_affected = data.get("rows_affected", 0)
        
        if not fixes:
            return "✅ No fixes were needed - your data is already in good shape!"
        
        response = f"🔧 **Data Fixed Successfully!**\n\n"
        response += f"Applied {len(fixes)} fixes affecting {rows_affected} rows:\n\n"
        
        for fix in fixes:
            fix_type = fix.get("type", "")
            if "missing_values" in fix_type:
                col = fix.get("column", "")
                count = fix.get("count", 0)
                method = fix.get("method", "")
                response += f"• **{col}**: Fixed {count} missing values using {method}\n"
            elif "duplicates" in fix_type:
                count = fix.get("count", 0)
                response += f"• **Duplicates**: Removed {count} duplicate rows\n"
            elif "type_conversion" in fix_type:
                col = fix.get("column", "")
                new_type = fix.get("new_type", "")
                response += f"• **{col}**: Converted to {new_type}\n"
        
        response += "\n✅ Your data is now clean and ready for analysis!"
        return response