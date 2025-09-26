#!/bin/bash

# Script to easily view traces
echo "🔍 Playwright Trace Viewer Helper"
echo "================================="
echo ""

# Check if traces directory exists
if [ ! -d "reports/traces" ]; then
    echo "❌ No traces directory found. Run tests with failures first."
    exit 1
fi

# Find all trace files
trace_files=(reports/traces/*.zip)

# Check if any trace files exist
if [ ! -f "${trace_files[0]}" ]; then
    echo "❌ No trace files found. Run tests with failures to generate traces."
    exit 1
fi

echo "📊 Available trace files:"
echo ""

# List all trace files with numbers
counter=1
for trace in "${trace_files[@]}"; do
    filename=$(basename "$trace")
    filesize=$(ls -lh "$trace" | awk '{print $5}')
    echo "  $counter) $filename ($filesize)"
    counter=$((counter + 1))
done

echo ""

# If only one trace file, open it directly
if [ ${#trace_files[@]} -eq 1 ]; then
    echo "🚀 Opening trace viewer for: $(basename "${trace_files[0]}")"
    echo ""
    npx playwright show-trace "${trace_files[0]}"
else
    # Multiple files - let user choose
    echo "Enter the number of the trace to view (or 'a' for all, or 'q' to quit): "
    read -r choice
    
    case $choice in
        q|Q)
            echo "👋 Goodbye!"
            exit 0
            ;;
        a|A)
            echo "🚀 Opening all trace files..."
            for trace in "${trace_files[@]}"; do
                echo "Opening: $(basename "$trace")"
                npx playwright show-trace "$trace" &
                sleep 1
            done
            wait
            ;;
        [1-9]*)
            if [ "$choice" -ge 1 ] && [ "$choice" -le ${#trace_files[@]} ]; then
                selected_trace="${trace_files[$((choice - 1))]}"
                echo "🚀 Opening trace viewer for: $(basename "$selected_trace")"
                echo ""
                npx playwright show-trace "$selected_trace"
            else
                echo "❌ Invalid choice. Please run the script again."
                exit 1
            fi
            ;;
        *)
            echo "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
fi