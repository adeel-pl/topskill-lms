#!/bin/bash

# Portal Routes Test Script
# Tests that all portal routes are properly configured

echo "🔍 Testing Portal Routes Configuration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Test 1: Check next.config.js has rewrites
echo "1. Checking next.config.js rewrites..."
if grep -q "rewrites()" frontend/next.config.js; then
    echo -e "${GREEN}✅ Rewrites function found${NC}"
else
    echo -e "${RED}❌ Rewrites function NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Check portal rewrite exists
if grep -q "/portal/:path\*" frontend/next.config.js; then
    echo -e "${GREEN}✅ Portal rewrite found${NC}"
else
    echo -e "${RED}❌ Portal rewrite NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Check BACKEND_URL in docker-compose.prod.yml
echo ""
echo "2. Checking docker-compose.prod.yml..."
if grep -q "BACKEND_URL" docker-compose.prod.yml; then
    echo -e "${GREEN}✅ BACKEND_URL configured in docker-compose.prod.yml${NC}"
else
    echo -e "${RED}❌ BACKEND_URL NOT configured${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 4: Check BACKEND_URL in Dockerfile
echo ""
echo "3. Checking frontend/Dockerfile..."
if grep -q "BACKEND_URL" frontend/Dockerfile; then
    echo -e "${GREEN}✅ BACKEND_URL configured in Dockerfile${NC}"
else
    echo -e "${RED}❌ BACKEND_URL NOT configured${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 5: Check for hardcoded localhost URLs in frontend code
echo ""
echo "4. Checking for hardcoded localhost URLs..."
HARDCODED=$(grep -r "localhost:8000\|localhost:3000" frontend/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | wc -l)
if [ "$HARDCODED" -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded localhost URLs found${NC}"
else
    echo -e "${YELLOW}⚠️  Found $HARDCODED potential hardcoded localhost URLs${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo "   Checking if they're in fallbacks (safe)..."
    grep -r "localhost:8000\|localhost:3000" frontend/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | head -5
fi

# Test 6: Check environment variable usage
echo ""
echo "5. Checking environment variable usage..."
if grep -q "process.env.NEXT_PUBLIC_API_URL\|process.env.BACKEND_URL" frontend/lib/api.ts; then
    echo -e "${GREEN}✅ Environment variables used in API config${NC}"
else
    echo -e "${YELLOW}⚠️  Environment variables may not be used${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Test 7: Check portal URLs exist in backend
echo ""
echo "6. Checking backend portal URLs..."
if grep -q "path('portal/'" backend/config/urls.py; then
    echo -e "${GREEN}✅ Portal URLs configured in backend${NC}"
else
    echo -e "${RED}❌ Portal URLs NOT configured in backend${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 8: Check specific portal routes
echo ""
echo "7. Checking specific portal routes in backend..."
ROUTES=("instructor/" "instructor/courses/" "login/" "register/")
for route in "${ROUTES[@]}"; do
    if grep -q "path('$route" backend/portal/urls.py; then
        echo -e "${GREEN}✅ Route: portal/$route${NC}"
    else
        echo -e "${YELLOW}⚠️  Route: portal/$route (not found)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Test Summary:"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Portal routes are properly configured.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Tests passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ Tests failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi





# Portal Routes Test Script
# Tests that all portal routes are properly configured

echo "🔍 Testing Portal Routes Configuration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Test 1: Check next.config.js has rewrites
echo "1. Checking next.config.js rewrites..."
if grep -q "rewrites()" frontend/next.config.js; then
    echo -e "${GREEN}✅ Rewrites function found${NC}"
else
    echo -e "${RED}❌ Rewrites function NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Check portal rewrite exists
if grep -q "/portal/:path\*" frontend/next.config.js; then
    echo -e "${GREEN}✅ Portal rewrite found${NC}"
else
    echo -e "${RED}❌ Portal rewrite NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Check BACKEND_URL in docker-compose.prod.yml
echo ""
echo "2. Checking docker-compose.prod.yml..."
if grep -q "BACKEND_URL" docker-compose.prod.yml; then
    echo -e "${GREEN}✅ BACKEND_URL configured in docker-compose.prod.yml${NC}"
else
    echo -e "${RED}❌ BACKEND_URL NOT configured${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 4: Check BACKEND_URL in Dockerfile
echo ""
echo "3. Checking frontend/Dockerfile..."
if grep -q "BACKEND_URL" frontend/Dockerfile; then
    echo -e "${GREEN}✅ BACKEND_URL configured in Dockerfile${NC}"
else
    echo -e "${RED}❌ BACKEND_URL NOT configured${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 5: Check for hardcoded localhost URLs in frontend code
echo ""
echo "4. Checking for hardcoded localhost URLs..."
HARDCODED=$(grep -r "localhost:8000\|localhost:3000" frontend/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | wc -l)
if [ "$HARDCODED" -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded localhost URLs found${NC}"
else
    echo -e "${YELLOW}⚠️  Found $HARDCODED potential hardcoded localhost URLs${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo "   Checking if they're in fallbacks (safe)..."
    grep -r "localhost:8000\|localhost:3000" frontend/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | head -5
fi

# Test 6: Check environment variable usage
echo ""
echo "5. Checking environment variable usage..."
if grep -q "process.env.NEXT_PUBLIC_API_URL\|process.env.BACKEND_URL" frontend/lib/api.ts; then
    echo -e "${GREEN}✅ Environment variables used in API config${NC}"
else
    echo -e "${YELLOW}⚠️  Environment variables may not be used${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Test 7: Check portal URLs exist in backend
echo ""
echo "6. Checking backend portal URLs..."
if grep -q "path('portal/'" backend/config/urls.py; then
    echo -e "${GREEN}✅ Portal URLs configured in backend${NC}"
else
    echo -e "${RED}❌ Portal URLs NOT configured in backend${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 8: Check specific portal routes
echo ""
echo "7. Checking specific portal routes in backend..."
ROUTES=("instructor/" "instructor/courses/" "login/" "register/")
for route in "${ROUTES[@]}"; do
    if grep -q "path('$route" backend/portal/urls.py; then
        echo -e "${GREEN}✅ Route: portal/$route${NC}"
    else
        echo -e "${YELLOW}⚠️  Route: portal/$route (not found)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Test Summary:"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Portal routes are properly configured.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Tests passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ Tests failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi








