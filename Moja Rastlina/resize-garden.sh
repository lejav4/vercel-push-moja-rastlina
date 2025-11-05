#!/bin/bash

# This script will resize all garden images to match garden-final.png dimensions

# First, let's find out the dimensions of garden-final.png using sips (built into macOS)
echo "Getting dimensions of garden-final.png..."
FINAL_DIMS=$(sips -g pixelWidth -g pixelHeight src/assets/garden-final.png 2>/dev/null | grep -E '(pixelWidth|pixelHeight)' | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')

if [ -z "$FINAL_DIMS" ]; then
    echo "Error: Could not get dimensions of garden-final.png"
    exit 1
fi

WIDTH=$(echo $FINAL_DIMS | cut -d'x' -f1)
HEIGHT=$(echo $FINAL_DIMS | cut -d'x' -f2)

echo "Target size: ${WIDTH}x${HEIGHT}"

# Resize all garden level images
for i in {1..13}; do
    FILE="src/assets/garden-l${i}.png"
    
    if [ -f "$FILE" ]; then
        echo "Resizing $FILE..."
        sips -z $HEIGHT $WIDTH "$FILE"
        echo "✓ Done: $FILE"
    else
        echo "✗ File not found: $FILE"
    fi
done

echo ""
echo "All garden images have been resized to ${WIDTH}x${HEIGHT}!"
