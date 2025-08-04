#!/usr/bin/env python3
"""
Marketing Campaign Data Quality Agent - Main Server
"""
import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from mcp_server import MCPServer
from ai_agent import DataQualityAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Marketing Campaign Data Quality Agent",
    description="AI-powered data quality validation and anomaly detection",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MCP server and AI agent
mcp_server = MCPServer()
ai_agent = DataQualityAgent(mcp_server)

@app.on_event("startup")
async def startup_event():
    """Initialize the MCP server on startup"""
    await mcp_server.initialize()
    logger.info("MCP Server initialized successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Data Quality Agent is running"}

@app.post("/chat")
async def chat_endpoint(request: Dict[str, Any]):
    """
    Main chat endpoint for natural language queries
    """
    try:
        query = request.get("message", "")
        if not query:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Process the query through the AI agent
        response = await ai_agent.process_query(query)
        
        return JSONResponse(content=response)
    
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-data")
async def upload_data_endpoint(request: Dict[str, Any]):
    """
    Endpoint to set the data file path for processing
    """
    try:
        file_path = request.get("file_path", "")
        if not file_path:
            raise HTTPException(status_code=400, detail="File path is required")
        
        # Validate file exists
        if not Path(file_path).exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Update the data path in MCP server
        await mcp_server.set_data_path(file_path)
        
        return {"status": "success", "message": f"Data file set to: {file_path}"}
    
    except Exception as e:
        logger.error(f"Error setting data file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools")
async def get_available_tools():
    """
    Get list of available MCP tools
    """
    try:
        tools = await mcp_server.get_available_tools()
        return {"tools": tools}
    except Exception as e:
        logger.error(f"Error getting tools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tool/{tool_name}")
async def execute_tool(tool_name: str, request: Dict[str, Any]):
    """
    Direct tool execution endpoint
    """
    try:
        result = await mcp_server.execute_tool(tool_name, request.get("params", {}))
        return result
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )