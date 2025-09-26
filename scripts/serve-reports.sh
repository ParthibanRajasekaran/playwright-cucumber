#!/bin/bash

# Script to serve reports locally for easy viewing
echo "🚀 Starting local report server..."
echo "📊 Reports will be available at http://localhost:8080"
echo ""
echo "Available reports:"
echo "• Main Summary: http://localhost:8080/index.html"
echo "• Cucumber Report: http://localhost:8080/cucumber-html-report/index.html"
echo "• Trace Index: http://localhost:8080/traces/index.html"
echo "• Screenshots: http://localhost:8080/screenshots/"
echo "• Videos: http://localhost:8080/videos/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if http-server is installed
if ! command -v http-server &> /dev/null; then
    echo "Installing http-server..."
    npm install -g http-server
fi

# Start the server
cd reports && http-server -p 8080 -o -c-1