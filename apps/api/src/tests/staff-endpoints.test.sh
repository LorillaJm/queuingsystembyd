#!/bin/bash

# Staff Endpoints Test Script
# Tests all staff endpoints with various scenarios

API_URL="http://localhost:3001"
PIN="1234"
BRANCH="MAIN"

echo "═══════════════════════════════════════════════════════════════"
echo "  STAFF ENDPOINTS TEST SUITE"
echo "═══════════════════════════════════════════════════════════════"
echo "API URL: $API_URL"
echo "Branch: $BRANCH"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo "─────────────────────────────────────────────────────────────"
    echo "Test: $name"
    echo "─────────────────────────────────────────────────────────────"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" \
            -H "x-staff-pin: $PIN")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "x-staff-pin: $PIN" \
            -d "$data")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "Status: $status"
    echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED (expected $expected_status, got $status)${NC}"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: Authentication - Valid PIN
test_endpoint \
    "Authentication - Valid PIN" \
    "POST" \
    "/api/staff/auth" \
    '{"pin":"'$PIN'"}' \
    "200"

# Test 2: Authentication - Invalid PIN
test_endpoint \
    "Authentication - Invalid PIN" \
    "POST" \
    "/api/staff/auth" \
    '{"pin":"wrong"}' \
    "401"

# Test 3: Get Tickets - With Auth
test_endpoint \
    "Get Tickets - With Auth" \
    "GET" \
    "/api/staff/tickets?branch=$BRANCH" \
    "" \
    "200"

# Test 4: Get Tickets - Without Auth
echo "─────────────────────────────────────────────────────────────"
echo "Test: Get Tickets - Without Auth"
echo "─────────────────────────────────────────────────────────────"
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/staff/tickets?branch=$BRANCH")
status=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
echo "Status: $status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
if [ "$status" = "401" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED (expected 401, got $status)${NC}"
    ((FAILED++))
fi
echo ""

# Test 5: Call Next - Success
test_endpoint \
    "Call Next - Success" \
    "POST" \
    "/api/staff/next" \
    '{"branch":"'$BRANCH'"}' \
    "200"

# Test 6: Call Next - Empty Queue (might be 404 if no tickets)
test_endpoint \
    "Call Next - Might be empty" \
    "POST" \
    "/api/staff/next" \
    '{"branch":"'$BRANCH'"}' \
    "200"

# Test 7: Call Specific - Valid
test_endpoint \
    "Call Specific - Valid Queue Number" \
    "POST" \
    "/api/staff/call" \
    '{"branch":"'$BRANCH'","queueNo":"A-001"}' \
    "200"

# Test 8: Call Specific - Invalid Queue Number
test_endpoint \
    "Call Specific - Invalid Queue Number" \
    "POST" \
    "/api/staff/call" \
    '{"branch":"'$BRANCH'","queueNo":"Z-999"}' \
    "404"

# Test 9: Mark Done - Valid
test_endpoint \
    "Mark Done - Valid" \
    "POST" \
    "/api/staff/mark-done" \
    '{"branch":"'$BRANCH'","queueNo":"A-001"}' \
    "200"

# Test 10: Mark Done - Already Done (Invalid Transition)
test_endpoint \
    "Mark Done - Already Done" \
    "POST" \
    "/api/staff/mark-done" \
    '{"branch":"'$BRANCH'","queueNo":"A-001"}' \
    "400"

# Test 11: No-Show - Valid
test_endpoint \
    "No-Show - Valid" \
    "POST" \
    "/api/staff/no-show" \
    '{"branch":"'$BRANCH'","queueNo":"A-002"}' \
    "200"

# Test 12: Get Statistics
test_endpoint \
    "Get Statistics" \
    "GET" \
    "/api/staff/stats?branch=$BRANCH" \
    "" \
    "200"

# Test 13: Missing Branch Parameter
test_endpoint \
    "Call Next - Missing Branch" \
    "POST" \
    "/api/staff/next" \
    '{}' \
    "400"

# Test 14: Invalid Branch
test_endpoint \
    "Call Next - Invalid Branch" \
    "POST" \
    "/api/staff/next" \
    '{"branch":"INVALID"}' \
    "400"

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Success Rate: $(awk "BEGIN {printf \"%.1f\", ($PASSED/($PASSED+$FAILED))*100}")%"
echo "═══════════════════════════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
