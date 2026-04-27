#!/bin/bash
BASE_URL=${1:-http://localhost:8080}

echo "Testing $BASE_URL..."

# Test GET /health
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ "$STATUS" = "200" ]; then
  echo "✅ GET /health → $STATUS"
else
  echo "❌ GET /health → $STATUS"
  exit 1
fi

# Test GET /
RESPONSE=$(curl -s $BASE_URL/)
HOSTNAME=$(echo $RESPONSE | grep -o '"hostname":"[^"]*"')
if [ -n "$HOSTNAME" ]; then
  echo "✅ GET / → $HOSTNAME"
else
  echo "❌ GET / → hostname manquant dans $RESPONSE"
  exit 1
fi

echo "All tests passed ✅"