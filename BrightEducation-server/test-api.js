/**
 * Comprehensive API Test Script
 * Tests all Bright Education API endpoints with performance monitoring
 * Includes positive and negative test cases
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  performance: {
    fast: [], // < 100ms
    normal: [], // 100-500ms
    slow: [], // 500-1000ms
    verySlow: [], // > 1000ms
  },
  endpoints: {}
};

// Performance thresholds (in ms)
const PERFORMANCE_THRESHOLDS = {
  FAST: 100,
  NORMAL: 500,
  SLOW: 1000
};

// Store created resources for cleanup
const createdResources = {
  academicYears: [],
  classTenures: [],
  sectionTenures: [],
  classSubjects: [],
  studentEnrollments: [],
  classTeacherTenures: [],
  subjectTeacherTenures: [],
  teacherTenures: [],
  staffTenures: [],
  managementTenures: [],
  users: []
};

// Auth token
let authToken = null;
let refreshToken = null;
let cookieString = null;
let cookieJar = {}; // Store cookies
let adminUserId = null;
let teacherUserId = null;
let studentUserId = null;
let staffUserId = null;
let managementUserId = null;

/**
 * Make an HTTP request with performance tracking
 */
async function makeRequest(method, endpoint, data = null, headers = {}) {
  const startTime = performance.now();
  const url = `${BASE_URL}${endpoint}`;
  
  // Build cookie string from cookie jar
  const cookieHeader = Object.entries(cookieJar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { 'Cookie': cookieHeader }),
      ...headers
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Extract cookies from response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Parse Set-Cookie header
      const cookies = setCookieHeader.split(', ');
      cookies.forEach(cookie => {
        const [nameValue, ...rest] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          cookieJar[name.trim()] = value.trim();
          
          // Also extract to variables for convenience
          if (name.trim() === 'accessToken') {
            authToken = value.trim();
          }
          if (name.trim() === 'refreshToken') {
            refreshToken = value.trim();
          }
        }
      });
    }
    
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData,
      duration,
      url
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      success: false,
      status: 0,
      data: { error: error.message },
      duration,
      url
    };
  }
}

/**
 * Record a test result
 */
function recordTest(category, testName, result, expectedSuccess = true) {
  testResults.total++;
  
  const passed = result.success === expectedSuccess;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({
      category,
      testName,
      expected: expectedSuccess ? 'success' : 'failure',
      actual: result.success ? 'success' : 'failure',
      status: result.status,
      data: result.data,
      duration: result.duration
    });
  }
  
  // Record performance
  if (result.success) {
    if (result.duration < PERFORMANCE_THRESHOLDS.FAST) {
      testResults.performance.fast.push({ category, testName, duration: result.duration });
    } else if (result.duration < PERFORMANCE_THRESHOLDS.NORMAL) {
      testResults.performance.normal.push({ category, testName, duration: result.duration });
    } else if (result.duration < PERFORMANCE_THRESHOLDS.SLOW) {
      testResults.performance.slow.push({ category, testName, duration: result.duration });
    } else {
      testResults.performance.verySlow.push({ category, testName, duration: result.duration });
    }
  }
  
  // Store endpoint result
  if (!testResults.endpoints[category]) {
    testResults.endpoints[category] = [];
  }
  testResults.endpoints[category].push({
    testName,
    passed,
    duration: result.duration,
    status: result.status
  });
  
  console.log(`${passed ? '✓' : '✗'} [${category}] ${testName} - ${result.duration.toFixed(2)}ms`);
  
  return result;
}

/**
 * Authentication Tests
 */
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===');
  
  // Test 1: Login with existing admin (from seed)
  const loginAdmin = await makeRequest('POST', '/auth/login', {
    email: 'admin@bright.com',
    password: 'bright@321'
  });
  recordTest('Authentication', 'Login Admin (Seed)', loginAdmin);
  
  // Check if cookies were set (even if token extraction failed)
  if (loginAdmin.success && Object.keys(cookieJar).length > 0) {
    console.log('Successfully logged in and cookies are set');
    console.log('Cookies:', Object.keys(cookieJar));
  } else {
    console.log('Failed to login with seed admin. Cannot proceed with tests.');
    console.log('Login response:', loginAdmin.data);
    console.log('Cookie jar:', cookieJar);
    return;
  }
  
  const headers = {}; // Cookies are handled automatically by cookie jar
  
  // Test 2: Get all users to find existing test users
  const getAllUsers = await makeRequest('GET', '/user/all', null, headers);
  recordTest('Authentication', 'Get All Users', getAllUsers);
  
  if (getAllUsers.success && getAllUsers.data.body) {
    // Handle different response structures
    let users = getAllUsers.data.body;
    if (!Array.isArray(users)) {
      // If body is not an array, check if it has a data property
      users = users.data || users.users || [];
    }
    
    if (Array.isArray(users)) {
      teacherUserId = users.find(u => u.role === 'TEACHER')?.id;
      studentUserId = users.find(u => u.role === 'STUDENT')?.id;
      staffUserId = users.find(u => u.role === 'STAFF')?.id;
      managementUserId = users.find(u => u.role === 'MANAGEMENT')?.id;
      
      console.log('Found existing users:', {
        teacher: teacherUserId ? 'Yes' : 'No',
        student: studentUserId ? 'Yes' : 'No',
        staff: staffUserId ? 'Yes' : 'No',
        management: managementUserId ? 'Yes' : 'No'
      });
    } else {
      console.log('Users response is not an array:', typeof users);
    }
  }
  
  // Test 3: Login with invalid credentials (should fail)
  const loginInvalid = await makeRequest('POST', '/auth/login', {
    email: 'invalid@email.com',
    password: 'wrongpassword'
  });
  recordTest('Authentication', 'Login Invalid Credentials', loginInvalid, false);
}

/**
 * Academic Year Tests
 */
async function testAcademicYear() {
  console.log('\n=== Testing Academic Year ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Test 1: Create Academic Year
  const createYear = await makeRequest('POST', '/academic-year', {
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  recordTest('Academic Year', 'Create Academic Year', createYear);
  if (createYear.success && createYear.data.body) {
    createdResources.academicYears.push(createYear.data.body.id);
  }
  
  // Test 2: Create duplicate academic year (should fail)
  const duplicateYear = await makeRequest('POST', '/academic-year', {
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  recordTest('Academic Year', 'Create Duplicate Academic Year', duplicateYear, false);
  
  // Test 3: Create with missing fields (should fail)
  const missingFields = await makeRequest('POST', '/academic-year', {
    name: '2025-2026'
  }, headers);
  recordTest('Academic Year', 'Create Missing Fields', missingFields, false);
  
  // Test 4: Create with invalid date format (should fail)
  const invalidDate = await makeRequest('POST', '/academic-year', {
    name: '2025-2026-Invalid',
    startDate: 'invalid-date',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  recordTest('Academic Year', 'Create Invalid Date Format', invalidDate, false);
  
  // Test 5: Create with invalid status (should fail)
  const invalidStatus = await makeRequest('POST', '/academic-year', {
    name: '2025-2026-InvalidStatus',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('Academic Year', 'Create Invalid Status', invalidStatus, false);
  
  // Test 6: Create with end date before start date (should fail)
  const invalidDateRange = await makeRequest('POST', '/academic-year', {
    name: '2025-2026-InvalidRange',
    startDate: '2026-06-30',
    endDate: '2025-09-01',
    status: 'ACTIVE'
  }, headers);
  recordTest('Academic Year', 'Create Invalid Date Range', invalidDateRange, false);
  
  // Test 7: Get All Academic Years
  const getAllYears = await makeRequest('GET', '/academic-year', null, headers);
  recordTest('Academic Year', 'Get All Academic Years', getAllYears);
  
  // Test 8: Get Academic Year by ID
  if (createdResources.academicYears.length > 0) {
    const getYearById = await makeRequest('GET', `/academic-year/${createdResources.academicYears[0]}`, null, headers);
    recordTest('Academic Year', 'Get Academic Year by ID', getYearById);
  }
  
  // Test 9: Update Academic Year
  if (createdResources.academicYears.length > 0) {
    const updateYear = await makeRequest('PUT', `/academic-year/${createdResources.academicYears[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('Academic Year', 'Update Academic Year', updateYear);
  }
  
  // Test 10: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/academic-year/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('Academic Year', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 11: Update with invalid status (should fail)
  if (createdResources.academicYears.length > 0) {
    const updateInvalidStatus = await makeRequest('PUT', `/academic-year/${createdResources.academicYears[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('Academic Year', 'Update Invalid Status', updateInvalidStatus, false);
  }
  
  // Test 12: Delete Academic Year
  if (createdResources.academicYears.length > 0) {
    const deleteYear = await makeRequest('DELETE', `/academic-year/${createdResources.academicYears[0]}`, null, headers);
    recordTest('Academic Year', 'Delete Academic Year', deleteYear);
    createdResources.academicYears.shift();
  }
  
  // Test 13: Delete non-existent academic year (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/academic-year/non-existent-id', null, headers);
  recordTest('Academic Year', 'Delete Non-existent Academic Year', deleteNonExistent, false);
  
  // Test 14: Get non-existent academic year (should fail)
  const getNonExistent = await makeRequest('GET', '/academic-year/non-existent-id', null, headers);
  recordTest('Academic Year', 'Get Non-existent Academic Year', getNonExistent, false);
}

/**
 * Class Tenure Tests
 */
async function testClassTenure() {
  console.log('\n=== Testing Class Tenure ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // First create an academic year
  const createYear = await makeRequest('POST', '/academic-year', {
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for class tenure tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  // Test 1: Create Class Tenure
  const createClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  recordTest('Class Tenure', 'Create Class Tenure', createClass);
  if (createClass.success && createClass.data.body) {
    createdResources.classTenures.push(createClass.data.body.id);
  }
  
  // Test 2: Create duplicate class in same year (should fail)
  const duplicateClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  recordTest('Class Tenure', 'Create Duplicate Class', duplicateClass, false);
  
  // Test 3: Create with invalid academic year (should fail)
  const invalidYear = await makeRequest('POST', '/class-tenure', {
    academicYearId: 'invalid-id',
    name: 'Grade 11'
  }, headers);
  recordTest('Class Tenure', 'Create Invalid Academic Year', invalidYear, false);
  
  // Test 4: Create with missing academic year ID (should fail)
  const missingYearId = await makeRequest('POST', '/class-tenure', {
    name: 'Grade 12'
  }, headers);
  recordTest('Class Tenure', 'Create Missing Academic Year ID', missingYearId, false);
  
  // Test 5: Create with missing name (should fail)
  const missingName = await makeRequest('POST', '/class-tenure', {
    academicYearId
  }, headers);
  recordTest('Class Tenure', 'Create Missing Name', missingName, false);
  
  // Test 6: Create with empty name (should fail)
  const emptyName = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: ''
  }, headers);
  recordTest('Class Tenure', 'Create Empty Name', emptyName, false);
  
  // Test 7: Get All Class Tenures
  const getAllClasses = await makeRequest('GET', '/class-tenure', null, headers);
  recordTest('Class Tenure', 'Get All Class Tenures', getAllClasses);
  
  // Test 8: Get Class Tenure by ID
  if (createdResources.classTenures.length > 0) {
    const getClassById = await makeRequest('GET', `/class-tenure/${createdResources.classTenures[0]}`, null, headers);
    recordTest('Class Tenure', 'Get Class Tenure by ID', getClassById);
  }
  
  // Test 9: Update Class Tenure
  if (createdResources.classTenures.length > 0) {
    const updateClass = await makeRequest('PUT', `/class-tenure/${createdResources.classTenures[0]}`, {
      name: 'Grade 10 Updated'
    }, headers);
    recordTest('Class Tenure', 'Update Class Tenure', updateClass);
  }
  
  // Test 10: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/class-tenure/non-existent-id', {
    name: 'Grade 11'
  }, headers);
  recordTest('Class Tenure', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 11: Update with empty name (should fail)
  if (createdResources.classTenures.length > 0) {
    const updateEmptyName = await makeRequest('PUT', `/class-tenure/${createdResources.classTenures[0]}`, {
      name: ''
    }, headers);
    recordTest('Class Tenure', 'Update Empty Name', updateEmptyName, false);
  }
  
  // Test 12: Delete Class Tenure
  if (createdResources.classTenures.length > 0) {
    const deleteClass = await makeRequest('DELETE', `/class-tenure/${createdResources.classTenures[0]}`, null, headers);
    recordTest('Class Tenure', 'Delete Class Tenure', deleteClass);
    createdResources.classTenures.shift();
  }
  
  // Test 13: Delete non-existent class tenure (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/class-tenure/non-existent-id', null, headers);
  recordTest('Class Tenure', 'Delete Non-existent Class Tenure', deleteNonExistent, false);
  
  // Test 14: Get non-existent class tenure (should fail)
  const getNonExistent = await makeRequest('GET', '/class-tenure/non-existent-id', null, headers);
  recordTest('Class Tenure', 'Get Non-existent Class Tenure', getNonExistent, false);
}

/**
 * Section Tenure Tests
 */
async function testSectionTenure() {
  console.log('\n=== Testing Section Tenure ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Create academic year and class tenure
  const createYear = await makeRequest('POST', '/academic-year', {
    name: `2024-2025-Section-${Date.now()}`,
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for section tenure tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  const createClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  
  if (!createClass.success) {
    console.log('Failed to create class tenure for section tenure tests');
    return;
  }
  
  const classTenureId = createClass.data.body.id;
  createdResources.classTenures.push(classTenureId);
  
  // Test 1: Create Section Tenure
  const createSection = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section A',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Section Tenure', createSection);
  if (createSection.success && createSection.data.body) {
    createdResources.sectionTenures.push(createSection.data.body.id);
  }
  
  // Test 2: Create duplicate section (should fail)
  const duplicateSection = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section A',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Duplicate Section', duplicateSection, false);
  
  // Test 3: Create with invalid class tenure (should fail)
  const invalidClass = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId: 'invalid-id',
    name: 'Section B',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Invalid Class Tenure', invalidClass, false);
  
  // Test 4: Create with missing academic year ID (should fail)
  const missingYearId = await makeRequest('POST', '/section-tenure', {
    classTenureId,
    name: 'Section C',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Missing Academic Year ID', missingYearId, false);
  
  // Test 5: Create with missing class tenure ID (should fail)
  const missingClassId = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    name: 'Section D',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Missing Class Tenure ID', missingClassId, false);
  
  // Test 6: Create with missing name (should fail)
  const missingName = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Missing Name', missingName, false);
  
  // Test 7: Create with empty name (should fail)
  const emptyName = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: '',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Create Empty Name', emptyName, false);
  
  // Test 8: Create with invalid capacity (negative) (should fail)
  const invalidCapacity = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section E',
    capacity: -10
  }, headers);
  recordTest('Section Tenure', 'Create Invalid Capacity (Negative)', invalidCapacity, false);
  
  // Test 9: Create with invalid capacity (zero) (should fail)
  const zeroCapacity = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section F',
    capacity: 0
  }, headers);
  recordTest('Section Tenure', 'Create Invalid Capacity (Zero)', zeroCapacity, false);
  
  // Test 10: Get All Section Tenures
  const getAllSections = await makeRequest('GET', '/section-tenure', null, headers);
  recordTest('Section Tenure', 'Get All Section Tenures', getAllSections);
  
  // Test 11: Get Section Tenure by ID
  if (createdResources.sectionTenures.length > 0) {
    const getSectionById = await makeRequest('GET', `/section-tenure/${createdResources.sectionTenures[0]}`, null, headers);
    recordTest('Section Tenure', 'Get Section Tenure by ID', getSectionById);
  }
  
  // Test 12: Update Section Tenure
  if (createdResources.sectionTenures.length > 0) {
    const updateSection = await makeRequest('PUT', `/section-tenure/${createdResources.sectionTenures[0]}`, {
      name: 'Section A Updated',
      capacity: 45
    }, headers);
    recordTest('Section Tenure', 'Update Section Tenure', updateSection);
  }
  
  // Test 13: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/section-tenure/non-existent-id', {
    name: 'Section B',
    capacity: 40
  }, headers);
  recordTest('Section Tenure', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 14: Update with empty name (should fail)
  if (createdResources.sectionTenures.length > 0) {
    const updateEmptyName = await makeRequest('PUT', `/section-tenure/${createdResources.sectionTenures[0]}`, {
      name: '',
      capacity: 40
    }, headers);
    recordTest('Section Tenure', 'Update Empty Name', updateEmptyName, false);
  }
  
  // Test 15: Update with invalid capacity (should fail)
  if (createdResources.sectionTenures.length > 0) {
    const updateInvalidCapacity = await makeRequest('PUT', `/section-tenure/${createdResources.sectionTenures[0]}`, {
      name: 'Section A',
      capacity: -5
    }, headers);
    recordTest('Section Tenure', 'Update Invalid Capacity', updateInvalidCapacity, false);
  }
  
  // Test 16: Delete Section Tenure
  if (createdResources.sectionTenures.length > 0) {
    const deleteSection = await makeRequest('DELETE', `/section-tenure/${createdResources.sectionTenures[0]}`, null, headers);
    recordTest('Section Tenure', 'Delete Section Tenure', deleteSection);
    createdResources.sectionTenures.shift();
  }
  
  // Test 17: Delete non-existent section tenure (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/section-tenure/non-existent-id', null, headers);
  recordTest('Section Tenure', 'Delete Non-existent Section Tenure', deleteNonExistent, false);
  
  // Test 18: Get non-existent section tenure (should fail)
  const getNonExistent = await makeRequest('GET', '/section-tenure/non-existent-id', null, headers);
  recordTest('Section Tenure', 'Get Non-existent Section Tenure', getNonExistent, false);
}

/**
 * Class Subject Tests
 */
async function testClassSubject() {
  console.log('\n=== Testing Class Subject ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Create academic year and class tenure
  const createYear = await makeRequest('POST', '/academic-year', {
    name: `2024-2025-Subject-${Date.now()}`,
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for class subject tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  const createClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  
  if (!createClass.success) {
    console.log('Failed to create class tenure for class subject tests');
    return;
  }
  
  const classTenureId = createClass.data.body.id;
  createdResources.classTenures.push(classTenureId);
  
  // Test 1: Create Class Subject
  const createSubject = await makeRequest('POST', '/class-subject', {
    classTenureId,
    name: 'Mathematics'
  }, headers);
  recordTest('Class Subject', 'Create Class Subject', createSubject);
  if (createSubject.success && createSubject.data.body) {
    createdResources.classSubjects.push(createSubject.data.body.id);
  }
  
  // Test 2: Create duplicate subject (should fail)
  const duplicateSubject = await makeRequest('POST', '/class-subject', {
    classTenureId,
    name: 'Mathematics'
  }, headers);
  recordTest('Class Subject', 'Create Duplicate Subject', duplicateSubject, false);
  
  // Test 3: Create with invalid class tenure (should fail)
  const invalidClass = await makeRequest('POST', '/class-subject', {
    classTenureId: 'invalid-id',
    name: 'Physics'
  }, headers);
  recordTest('Class Subject', 'Create Invalid Class Tenure', invalidClass, false);
  
  // Test 4: Create with missing class tenure ID (should fail)
  const missingClassId = await makeRequest('POST', '/class-subject', {
    name: 'Chemistry'
  }, headers);
  recordTest('Class Subject', 'Create Missing Class Tenure ID', missingClassId, false);
  
  // Test 5: Create with missing name (should fail)
  const missingName = await makeRequest('POST', '/class-subject', {
    classTenureId
  }, headers);
  recordTest('Class Subject', 'Create Missing Name', missingName, false);
  
  // Test 6: Create with empty name (should fail)
  const emptyName = await makeRequest('POST', '/class-subject', {
    classTenureId,
    name: ''
  }, headers);
  recordTest('Class Subject', 'Create Empty Name', emptyName, false);
  
  // Test 7: Get All Class Subjects
  const getAllSubjects = await makeRequest('GET', '/class-subject', null, headers);
  recordTest('Class Subject', 'Get All Class Subjects', getAllSubjects);
  
  // Test 8: Get Class Subject by ID
  if (createdResources.classSubjects.length > 0) {
    const getSubjectById = await makeRequest('GET', `/class-subject/${createdResources.classSubjects[0]}`, null, headers);
    recordTest('Class Subject', 'Get Class Subject by ID', getSubjectById);
  }
  
  // Test 9: Update Class Subject
  if (createdResources.classSubjects.length > 0) {
    const updateSubject = await makeRequest('PUT', `/class-subject/${createdResources.classSubjects[0]}`, {
      name: 'Mathematics Updated'
    }, headers);
    recordTest('Class Subject', 'Update Class Subject', updateSubject);
  }
  
  // Test 10: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/class-subject/non-existent-id', {
    name: 'Physics'
  }, headers);
  recordTest('Class Subject', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 11: Update with empty name (should fail)
  if (createdResources.classSubjects.length > 0) {
    const updateEmptyName = await makeRequest('PUT', `/class-subject/${createdResources.classSubjects[0]}`, {
      name: ''
    }, headers);
    recordTest('Class Subject', 'Update Empty Name', updateEmptyName, false);
  }
  
  // Test 12: Delete Class Subject
  if (createdResources.classSubjects.length > 0) {
    const deleteSubject = await makeRequest('DELETE', `/class-subject/${createdResources.classSubjects[0]}`, null, headers);
    recordTest('Class Subject', 'Delete Class Subject', deleteSubject);
    createdResources.classSubjects.shift();
  }
  
  // Test 13: Delete non-existent class subject (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/class-subject/non-existent-id', null, headers);
  recordTest('Class Subject', 'Delete Non-existent Class Subject', deleteNonExistent, false);
  
  // Test 14: Get non-existent class subject (should fail)
  const getNonExistent = await makeRequest('GET', '/class-subject/non-existent-id', null, headers);
  recordTest('Class Subject', 'Get Non-existent Class Subject', getNonExistent, false);
}

/**
 * Student Enrollment Tests
 */
async function testStudentEnrollment() {
  console.log('\n=== Testing Student Enrollment ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Create academic year, class tenure, and section tenure
  const createYear = await makeRequest('POST', '/academic-year', {
    name: `2024-2025-Enrollment-${Date.now()}`,
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for student enrollment tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  const createClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  
  if (!createClass.success) {
    console.log('Failed to create class tenure for student enrollment tests');
    return;
  }
  
  const classTenureId = createClass.data.body.id;
  createdResources.classTenures.push(classTenureId);
  
  const createSection = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section A',
    capacity: 40
  }, headers);
  
  if (!createSection.success) {
    console.log('Failed to create section tenure for student enrollment tests');
    return;
  }
  
  const sectionTenureId = createSection.data.body.id;
  createdResources.sectionTenures.push(sectionTenureId);
  
  // Test 1: Create Student Enrollment
  const createEnrollment = await makeRequest('POST', '/student-enrollment', {
    studentId: studentUserId,
    academicYearId,
    sectionTenureId,
    rollNumber: '1',
    status: 'ACTIVE'
  }, headers);
  recordTest('Student Enrollment', 'Create Student Enrollment', createEnrollment);
  if (createEnrollment.success && createEnrollment.data.body) {
    createdResources.studentEnrollments.push(createEnrollment.data.body.id);
  }
  
  // Test 2: Create duplicate enrollment (should fail)
  const duplicateEnrollment = await makeRequest('POST', '/student-enrollment', {
    studentId: studentUserId,
    academicYearId,
    sectionTenureId,
    rollNumber: '2'
  }, headers);
  recordTest('Student Enrollment', 'Create Duplicate Enrollment', duplicateEnrollment, false);
  
  // Test 3: Create with invalid student (should fail)
  const invalidStudent = await makeRequest('POST', '/student-enrollment', {
    studentId: 'invalid-id',
    academicYearId,
    sectionTenureId
  }, headers);
  recordTest('Student Enrollment', 'Create Invalid Student', invalidStudent, false);
  
  // Test 4: Create with missing student ID (should fail)
  const missingStudentId = await makeRequest('POST', '/student-enrollment', {
    academicYearId,
    sectionTenureId
  }, headers);
  recordTest('Student Enrollment', 'Create Missing Student ID', missingStudentId, false);
  
  // Test 5: Create with missing academic year ID (should fail)
  const missingYearId = await makeRequest('POST', '/student-enrollment', {
    studentId: studentUserId,
    sectionTenureId
  }, headers);
  recordTest('Student Enrollment', 'Create Missing Academic Year ID', missingYearId, false);
  
  // Test 6: Create with missing section tenure ID (should fail)
  const missingSectionId = await makeRequest('POST', '/student-enrollment', {
    studentId: studentUserId,
    academicYearId
  }, headers);
  recordTest('Student Enrollment', 'Create Missing Section Tenure ID', missingSectionId, false);
  
  // Test 7: Create with invalid status (should fail)
  const invalidStatus = await makeRequest('POST', '/student-enrollment', {
    studentId: studentUserId,
    academicYearId,
    sectionTenureId,
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('Student Enrollment', 'Create Invalid Status', invalidStatus, false);
  
  // Test 8: Get All Student Enrollments
  const getAllEnrollments = await makeRequest('GET', '/student-enrollment', null, headers);
  recordTest('Student Enrollment', 'Get All Student Enrollments', getAllEnrollments);
  
  // Test 9: Get Student Enrollment by ID
  if (createdResources.studentEnrollments.length > 0) {
    const getEnrollmentById = await makeRequest('GET', `/student-enrollment/${createdResources.studentEnrollments[0]}`, null, headers);
    recordTest('Student Enrollment', 'Get Student Enrollment by ID', getEnrollmentById);
  }
  
  // Test 10: Update Student Enrollment
  if (createdResources.studentEnrollments.length > 0) {
    const updateEnrollment = await makeRequest('PUT', `/student-enrollment/${createdResources.studentEnrollments[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('Student Enrollment', 'Update Student Enrollment', updateEnrollment);
  }
  
  // Test 11: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/student-enrollment/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('Student Enrollment', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 12: Update with invalid status (should fail)
  if (createdResources.studentEnrollments.length > 0) {
    const updateInvalidStatus = await makeRequest('PUT', `/student-enrollment/${createdResources.studentEnrollments[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('Student Enrollment', 'Update Invalid Status', updateInvalidStatus, false);
  }
  
  // Test 13: Delete Student Enrollment
  if (createdResources.studentEnrollments.length > 0) {
    const deleteEnrollment = await makeRequest('DELETE', `/student-enrollment/${createdResources.studentEnrollments[0]}`, null, headers);
    recordTest('Student Enrollment', 'Delete Student Enrollment', deleteEnrollment);
    createdResources.studentEnrollments.shift();
  }
  
  // Test 14: Delete non-existent enrollment (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/student-enrollment/non-existent-id', null, headers);
  recordTest('Student Enrollment', 'Delete Non-existent Enrollment', deleteNonExistent, false);
  
  // Test 15: Get non-existent enrollment (should fail)
  const getNonExistent = await makeRequest('GET', '/student-enrollment/non-existent-id', null, headers);
  recordTest('Student Enrollment', 'Get Non-existent Enrollment', getNonExistent, false);
}

/**
 * Class Teacher Tenure Tests
 */
async function testClassTeacherTenure() {
  console.log('\n=== Testing Class Teacher Tenure ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Create academic year and section tenure
  const createYear = await makeRequest('POST', '/academic-year', {
    name: `2024-2025-ClassTeacher-${Date.now()}`,
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for class teacher tenure tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  const createClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  
  if (!createClass.success) {
    console.log('Failed to create class tenure for class teacher tenure tests');
    return;
  }
  
  const classTenureId = createClass.data.body.id;
  createdResources.classTenures.push(classTenureId);
  
  const createSection = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section A',
    capacity: 40
  }, headers);
  
  if (!createSection.success) {
    console.log('Failed to create section tenure for class teacher tenure tests');
    return;
  }
  
  const sectionTenureId = createSection.data.body.id;
  createdResources.sectionTenures.push(sectionTenureId);
  
  // Test 1: Create Class Teacher Tenure
  const createClassTeacher = await makeRequest('POST', '/class-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    teacherId: teacherUserId,
    status: 'ACTIVE'
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Class Teacher Tenure', createClassTeacher);
  if (createClassTeacher.success && createClassTeacher.data.body) {
    createdResources.classTeacherTenures.push(createClassTeacher.data.body.id);
  }
  
  // Test 2: Create duplicate class teacher (should fail)
  const duplicateClassTeacher = await makeRequest('POST', '/class-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Duplicate Class Teacher', duplicateClassTeacher, false);
  
  // Test 3: Create with invalid teacher (should fail)
  const invalidTeacher = await makeRequest('POST', '/class-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    teacherId: 'invalid-id'
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Invalid Teacher', invalidTeacher, false);
  
  // Test 4: Create with missing teacher ID (should fail)
  const missingTeacherId = await makeRequest('POST', '/class-teacher-tenure', {
    academicYearId,
    sectionTenureId
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Missing Teacher ID', missingTeacherId, false);
  
  // Test 5: Create with missing academic year ID (should fail)
  const missingYearId = await makeRequest('POST', '/class-teacher-tenure', {
    sectionTenureId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Missing Academic Year ID', missingYearId, false);
  
  // Test 6: Create with missing section tenure ID (should fail)
  const missingSectionId = await makeRequest('POST', '/class-teacher-tenure', {
    academicYearId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Missing Section Tenure ID', missingSectionId, false);
  
  // Test 7: Create with invalid status (should fail)
  const invalidStatus = await makeRequest('POST', '/class-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    teacherId: teacherUserId,
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('Class Teacher Tenure', 'Create Invalid Status', invalidStatus, false);
  
  // Test 8: Get All Class Teacher Tenures
  const getAllClassTeachers = await makeRequest('GET', '/class-teacher-tenure', null, headers);
  recordTest('Class Teacher Tenure', 'Get All Class Teacher Tenures', getAllClassTeachers);
  
  // Test 9: Get Class Teacher Tenure by ID
  if (createdResources.classTeacherTenures.length > 0) {
    const getClassTeacherById = await makeRequest('GET', `/class-teacher-tenure/${createdResources.classTeacherTenures[0]}`, null, headers);
    recordTest('Class Teacher Tenure', 'Get Class Teacher Tenure by ID', getClassTeacherById);
  }
  
  // Test 10: Update Class Teacher Tenure
  if (createdResources.classTeacherTenures.length > 0) {
    const updateClassTeacher = await makeRequest('PUT', `/class-teacher-tenure/${createdResources.classTeacherTenures[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('Class Teacher Tenure', 'Update Class Teacher Tenure', updateClassTeacher);
  }
  
  // Test 11: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/class-teacher-tenure/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('Class Teacher Tenure', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 12: Update with invalid status (should fail)
  if (createdResources.classTeacherTenures.length > 0) {
    const updateInvalidStatus = await makeRequest('PUT', `/class-teacher-tenure/${createdResources.classTeacherTenures[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('Class Teacher Tenure', 'Update Invalid Status', updateInvalidStatus, false);
  }
  
  // Test 13: Delete Class Teacher Tenure
  if (createdResources.classTeacherTenures.length > 0) {
    const deleteClassTeacher = await makeRequest('DELETE', `/class-teacher-tenure/${createdResources.classTeacherTenures[0]}`, null, headers);
    recordTest('Class Teacher Tenure', 'Delete Class Teacher Tenure', deleteClassTeacher);
    createdResources.classTeacherTenures.shift();
  }
  
  // Test 14: Delete non-existent class teacher tenure (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/class-teacher-tenure/non-existent-id', null, headers);
  recordTest('Class Teacher Tenure', 'Delete Non-existent Class Teacher Tenure', deleteNonExistent, false);
  
  // Test 15: Get non-existent class teacher tenure (should fail)
  const getNonExistent = await makeRequest('GET', '/class-teacher-tenure/non-existent-id', null, headers);
  recordTest('Class Teacher Tenure', 'Get Non-existent Class Teacher Tenure', getNonExistent, false);
}

/**
 * Subject Teacher Tenure Tests
 */
async function testSubjectTeacherTenure() {
  console.log('\n=== Testing Subject Teacher Tenure ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Create academic year, section tenure, and class subject
  const createYear = await makeRequest('POST', '/academic-year', {
    name: `2024-2025-SubjectTeacher-${Date.now()}`,
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for subject teacher tenure tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  const createClass = await makeRequest('POST', '/class-tenure', {
    academicYearId,
    name: 'Grade 10'
  }, headers);
  
  if (!createClass.success) {
    console.log('Failed to create class tenure for subject teacher tenure tests');
    return;
  }
  
  const classTenureId = createClass.data.body.id;
  createdResources.classTenures.push(classTenureId);
  
  const createSection = await makeRequest('POST', '/section-tenure', {
    academicYearId,
    classTenureId,
    name: 'Section A',
    capacity: 40
  }, headers);
  
  if (!createSection.success) {
    console.log('Failed to create section tenure for subject teacher tenure tests');
    return;
  }
  
  const sectionTenureId = createSection.data.body.id;
  createdResources.sectionTenures.push(sectionTenureId);
  
  const createSubject = await makeRequest('POST', '/class-subject', {
    classTenureId,
    name: 'Physics'
  }, headers);
  
  if (!createSubject.success) {
    console.log('Failed to create class subject for subject teacher tenure tests');
    return;
  }
  
  const classSubjectId = createSubject.data.body.id;
  createdResources.classSubjects.push(classSubjectId);
  
  // Test 1: Create Subject Teacher Tenure
  const createSubjectTeacher = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    classSubjectId,
    teacherId: teacherUserId,
    status: 'ACTIVE'
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Subject Teacher Tenure', createSubjectTeacher);
  if (createSubjectTeacher.success && createSubjectTeacher.data.body) {
    createdResources.subjectTeacherTenures.push(createSubjectTeacher.data.body.id);
  }
  
  // Test 2: Create duplicate subject teacher (should fail)
  const duplicateSubjectTeacher = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    classSubjectId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Duplicate Subject Teacher', duplicateSubjectTeacher, false);
  
  // Test 3: Create with invalid teacher (should fail)
  const invalidTeacher = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    classSubjectId,
    teacherId: 'invalid-id'
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Invalid Teacher', invalidTeacher, false);
  
  // Test 4: Create with missing teacher ID (should fail)
  const missingTeacherId = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    classSubjectId
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Missing Teacher ID', missingTeacherId, false);
  
  // Test 5: Create with missing academic year ID (should fail)
  const missingYearId = await makeRequest('POST', '/subject-teacher-tenure', {
    sectionTenureId,
    classSubjectId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Missing Academic Year ID', missingYearId, false);
  
  // Test 6: Create with missing section tenure ID (should fail)
  const missingSectionId = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    classSubjectId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Missing Section Tenure ID', missingSectionId, false);
  
  // Test 7: Create with missing class subject ID (should fail)
  const missingSubjectId = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    teacherId: teacherUserId
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Missing Class Subject ID', missingSubjectId, false);
  
  // Test 8: Create with invalid status (should fail)
  const invalidStatus = await makeRequest('POST', '/subject-teacher-tenure', {
    academicYearId,
    sectionTenureId,
    classSubjectId,
    teacherId: teacherUserId,
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('Subject Teacher Tenure', 'Create Invalid Status', invalidStatus, false);
  
  // Test 9: Get All Subject Teacher Tenures
  const getAllSubjectTeachers = await makeRequest('GET', '/subject-teacher-tenure', null, headers);
  recordTest('Subject Teacher Tenure', 'Get All Subject Teacher Tenures', getAllSubjectTeachers);
  
  // Test 10: Get Subject Teacher Tenure by ID
  if (createdResources.subjectTeacherTenures.length > 0) {
    const getSubjectTeacherById = await makeRequest('GET', `/subject-teacher-tenure/${createdResources.subjectTeacherTenures[0]}`, null, headers);
    recordTest('Subject Teacher Tenure', 'Get Subject Teacher Tenure by ID', getSubjectTeacherById);
  }
  
  // Test 11: Update Subject Teacher Tenure
  if (createdResources.subjectTeacherTenures.length > 0) {
    const updateSubjectTeacher = await makeRequest('PUT', `/subject-teacher-tenure/${createdResources.subjectTeacherTenures[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('Subject Teacher Tenure', 'Update Subject Teacher Tenure', updateSubjectTeacher);
  }
  
  // Test 12: Update with invalid ID (should fail)
  const updateInvalidId = await makeRequest('PUT', '/subject-teacher-tenure/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('Subject Teacher Tenure', 'Update Invalid ID', updateInvalidId, false);
  
  // Test 13: Update with invalid status (should fail)
  if (createdResources.subjectTeacherTenures.length > 0) {
    const updateInvalidStatus = await makeRequest('PUT', `/subject-teacher-tenure/${createdResources.subjectTeacherTenures[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('Subject Teacher Tenure', 'Update Invalid Status', updateInvalidStatus, false);
  }
  
  // Test 14: Delete Subject Teacher Tenure
  if (createdResources.subjectTeacherTenures.length > 0) {
    const deleteSubjectTeacher = await makeRequest('DELETE', `/subject-teacher-tenure/${createdResources.subjectTeacherTenures[0]}`, null, headers);
    recordTest('Subject Teacher Tenure', 'Delete Subject Teacher Tenure', deleteSubjectTeacher);
    createdResources.subjectTeacherTenures.shift();
  }
  
  // Test 15: Delete non-existent subject teacher tenure (should fail)
  const deleteNonExistent = await makeRequest('DELETE', '/subject-teacher-tenure/non-existent-id', null, headers);
  recordTest('Subject Teacher Tenure', 'Delete Non-existent Subject Teacher Tenure', deleteNonExistent, false);
  
  // Test 16: Get non-existent subject teacher tenure (should fail)
  const getNonExistent = await makeRequest('GET', '/subject-teacher-tenure/non-existent-id', null, headers);
  recordTest('Subject Teacher Tenure', 'Get Non-existent Subject Teacher Tenure', getNonExistent, false);
}

/**
 * User Tenure Tests (Teacher, Staff, Management)
 */
async function testUserTenures() {
  console.log('\n=== Testing User Tenures ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Create academic year
  const createYear = await makeRequest('POST', '/academic-year', {
    name: `2024-2025-UserTenure-${Date.now()}`,
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    status: 'ACTIVE'
  }, headers);
  
  if (!createYear.success) {
    console.log('Failed to create academic year for user tenure tests');
    return;
  }
  
  const academicYearId = createYear.data.body.id;
  createdResources.academicYears.push(academicYearId);
  
  // Test Teacher Tenure
  const createTeacherTenure = await makeRequest('POST', '/teacher-tenure', {
    academicYearId,
    teacherId: teacherUserId,
    status: 'ACTIVE'
  }, headers);
  recordTest('User Tenure', 'Create Teacher Tenure', createTeacherTenure);
  if (createTeacherTenure.success && createTeacherTenure.data.body) {
    createdResources.teacherTenures.push(createTeacherTenure.data.body.id);
  }
  
  const duplicateTeacherTenure = await makeRequest('POST', '/teacher-tenure', {
    academicYearId,
    teacherId: teacherUserId
  }, headers);
  recordTest('User Tenure', 'Create Duplicate Teacher Tenure', duplicateTeacherTenure, false);
  
  // Teacher Tenure negative tests
  const invalidTeacherTenure = await makeRequest('POST', '/teacher-tenure', {
    academicYearId,
    teacherId: 'invalid-id'
  }, headers);
  recordTest('User Tenure', 'Create Teacher Tenure Invalid Teacher', invalidTeacherTenure, false);
  
  const missingTeacherId = await makeRequest('POST', '/teacher-tenure', {
    academicYearId
  }, headers);
  recordTest('User Tenure', 'Create Teacher Tenure Missing Teacher ID', missingTeacherId, false);
  
  const missingYearForTeacher = await makeRequest('POST', '/teacher-tenure', {
    teacherId: teacherUserId
  }, headers);
  recordTest('User Tenure', 'Create Teacher Tenure Missing Academic Year ID', missingYearForTeacher, false);
  
  const invalidStatusTeacher = await makeRequest('POST', '/teacher-tenure', {
    academicYearId,
    teacherId: teacherUserId,
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('User Tenure', 'Create Teacher Tenure Invalid Status', invalidStatusTeacher, false);
  
  // Test Staff Tenure
  const createStaffTenure = await makeRequest('POST', '/staff-tenure', {
    academicYearId,
    staffId: staffUserId,
    status: 'ACTIVE'
  }, headers);
  recordTest('User Tenure', 'Create Staff Tenure', createStaffTenure);
  if (createStaffTenure.success && createStaffTenure.data.body) {
    createdResources.staffTenures.push(createStaffTenure.data.body.id);
  }
  
  const duplicateStaffTenure = await makeRequest('POST', '/staff-tenure', {
    academicYearId,
    staffId: staffUserId
  }, headers);
  recordTest('User Tenure', 'Create Duplicate Staff Tenure', duplicateStaffTenure, false);
  
  // Staff Tenure negative tests
  const invalidStaffTenure = await makeRequest('POST', '/staff-tenure', {
    academicYearId,
    staffId: 'invalid-id'
  }, headers);
  recordTest('User Tenure', 'Create Staff Tenure Invalid Staff', invalidStaffTenure, false);
  
  const missingStaffId = await makeRequest('POST', '/staff-tenure', {
    academicYearId
  }, headers);
  recordTest('User Tenure', 'Create Staff Tenure Missing Staff ID', missingStaffId, false);
  
  const missingYearForStaff = await makeRequest('POST', '/staff-tenure', {
    staffId: staffUserId
  }, headers);
  recordTest('User Tenure', 'Create Staff Tenure Missing Academic Year ID', missingYearForStaff, false);
  
  const invalidStatusStaff = await makeRequest('POST', '/staff-tenure', {
    academicYearId,
    staffId: staffUserId,
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('User Tenure', 'Create Staff Tenure Invalid Status', invalidStatusStaff, false);
  
  // Test Management Tenure
  const createManagementTenure = await makeRequest('POST', '/management-tenure', {
    academicYearId,
    managementId: managementUserId,
    status: 'ACTIVE'
  }, headers);
  recordTest('User Tenure', 'Create Management Tenure', createManagementTenure);
  if (createManagementTenure.success && createManagementTenure.data.body) {
    createdResources.managementTenures.push(createManagementTenure.data.body.id);
  }
  
  const duplicateManagementTenure = await makeRequest('POST', '/management-tenure', {
    academicYearId,
    managementId: managementUserId
  }, headers);
  recordTest('User Tenure', 'Create Duplicate Management Tenure', duplicateManagementTenure, false);
  
  // Management Tenure negative tests
  const invalidManagementTenure = await makeRequest('POST', '/management-tenure', {
    academicYearId,
    managementId: 'invalid-id'
  }, headers);
  recordTest('User Tenure', 'Create Management Tenure Invalid Management', invalidManagementTenure, false);
  
  const missingManagementId = await makeRequest('POST', '/management-tenure', {
    academicYearId
  }, headers);
  recordTest('User Tenure', 'Create Management Tenure Missing Management ID', missingManagementId, false);
  
  const missingYearForManagement = await makeRequest('POST', '/management-tenure', {
    managementId: managementUserId
  }, headers);
  recordTest('User Tenure', 'Create Management Tenure Missing Academic Year ID', missingYearForManagement, false);
  
  const invalidStatusManagement = await makeRequest('POST', '/management-tenure', {
    academicYearId,
    managementId: managementUserId,
    status: 'INVALID_STATUS'
  }, headers);
  recordTest('User Tenure', 'Create Management Tenure Invalid Status', invalidStatusManagement, false);
  
  // Get all tenures
  const getAllTeacherTenures = await makeRequest('GET', '/teacher-tenure', null, headers);
  recordTest('User Tenure', 'Get All Teacher Tenures', getAllTeacherTenures);
  
  const getAllStaffTenures = await makeRequest('GET', '/staff-tenure', null, headers);
  recordTest('User Tenure', 'Get All Staff Tenures', getAllStaffTenures);
  
  const getAllManagementTenures = await makeRequest('GET', '/management-tenure', null, headers);
  recordTest('User Tenure', 'Get All Management Tenures', getAllManagementTenures);
  
  // Update tenures
  if (createdResources.teacherTenures.length > 0) {
    const updateTeacherTenure = await makeRequest('PUT', `/teacher-tenure/${createdResources.teacherTenures[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('User Tenure', 'Update Teacher Tenure', updateTeacherTenure);
  }
  
  // Update negative tests
  const updateInvalidTeacherId = await makeRequest('PUT', '/teacher-tenure/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('User Tenure', 'Update Teacher Tenure Invalid ID', updateInvalidTeacherId, false);
  
  if (createdResources.teacherTenures.length > 0) {
    const updateTeacherInvalidStatus = await makeRequest('PUT', `/teacher-tenure/${createdResources.teacherTenures[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('User Tenure', 'Update Teacher Tenure Invalid Status', updateTeacherInvalidStatus, false);
  }
  
  if (createdResources.staffTenures.length > 0) {
    const updateStaffTenure = await makeRequest('PUT', `/staff-tenure/${createdResources.staffTenures[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('User Tenure', 'Update Staff Tenure', updateStaffTenure);
  }
  
  const updateInvalidStaffId = await makeRequest('PUT', '/staff-tenure/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('User Tenure', 'Update Staff Tenure Invalid ID', updateInvalidStaffId, false);
  
  if (createdResources.staffTenures.length > 0) {
    const updateStaffInvalidStatus = await makeRequest('PUT', `/staff-tenure/${createdResources.staffTenures[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('User Tenure', 'Update Staff Tenure Invalid Status', updateStaffInvalidStatus, false);
  }
  
  if (createdResources.managementTenures.length > 0) {
    const updateManagementTenure = await makeRequest('PUT', `/management-tenure/${createdResources.managementTenures[0]}`, {
      status: 'INACTIVE'
    }, headers);
    recordTest('User Tenure', 'Update Management Tenure', updateManagementTenure);
  }
  
  const updateInvalidManagementId = await makeRequest('PUT', '/management-tenure/non-existent-id', {
    status: 'INACTIVE'
  }, headers);
  recordTest('User Tenure', 'Update Management Tenure Invalid ID', updateInvalidManagementId, false);
  
  if (createdResources.managementTenures.length > 0) {
    const updateManagementInvalidStatus = await makeRequest('PUT', `/management-tenure/${createdResources.managementTenures[0]}`, {
      status: 'INVALID_STATUS'
    }, headers);
    recordTest('User Tenure', 'Update Management Tenure Invalid Status', updateManagementInvalidStatus, false);
  }
  
  // Delete tenures
  if (createdResources.teacherTenures.length > 0) {
    const deleteTeacherTenure = await makeRequest('DELETE', `/teacher-tenure/${createdResources.teacherTenures[0]}`, null, headers);
    recordTest('User Tenure', 'Delete Teacher Tenure', deleteTeacherTenure);
    createdResources.teacherTenures.shift();
  }
  
  const deleteInvalidTeacherId = await makeRequest('DELETE', '/teacher-tenure/non-existent-id', null, headers);
  recordTest('User Tenure', 'Delete Teacher Tenure Invalid ID', deleteInvalidTeacherId, false);
  
  if (createdResources.staffTenures.length > 0) {
    const deleteStaffTenure = await makeRequest('DELETE', `/staff-tenure/${createdResources.staffTenures[0]}`, null, headers);
    recordTest('User Tenure', 'Delete Staff Tenure', deleteStaffTenure);
    createdResources.staffTenures.shift();
  }
  
  const deleteInvalidStaffId = await makeRequest('DELETE', '/staff-tenure/non-existent-id', null, headers);
  recordTest('User Tenure', 'Delete Staff Tenure Invalid ID', deleteInvalidStaffId, false);
  
  if (createdResources.managementTenures.length > 0) {
    const deleteManagementTenure = await makeRequest('DELETE', `/management-tenure/${createdResources.managementTenures[0]}`, null, headers);
    recordTest('User Tenure', 'Delete Management Tenure', deleteManagementTenure);
    createdResources.managementTenures.shift();
  }
  
  const deleteInvalidManagementId = await makeRequest('DELETE', '/management-tenure/non-existent-id', null, headers);
  recordTest('User Tenure', 'Delete Management Tenure Invalid ID', deleteInvalidManagementId, false);
  
  // Get non-existent tenures
  const getNonExistentTeacher = await makeRequest('GET', '/teacher-tenure/non-existent-id', null, headers);
  recordTest('User Tenure', 'Get Non-existent Teacher Tenure', getNonExistentTeacher, false);
  
  const getNonExistentStaff = await makeRequest('GET', '/staff-tenure/non-existent-id', null, headers);
  recordTest('User Tenure', 'Get Non-existent Staff Tenure', getNonExistentStaff, false);
  
  const getNonExistentManagement = await makeRequest('GET', '/management-tenure/non-existent-id', null, headers);
  recordTest('User Tenure', 'Get Non-existent Management Tenure', getNonExistentManagement, false);
}

/**
 * Cleanup created resources
 */
async function cleanup() {
  console.log('\n=== Cleaning Up Created Resources ===');
  
  const headers = {}; // Cookies are handled automatically
  
  // Delete in reverse order of dependencies
  for (const id of createdResources.studentEnrollments) {
    await makeRequest('DELETE', `/student-enrollment/${id}`, null, headers);
  }
  
  for (const id of createdResources.subjectTeacherTenures) {
    await makeRequest('DELETE', `/subject-teacher-tenure/${id}`, null, headers);
  }
  
  for (const id of createdResources.classTeacherTenures) {
    await makeRequest('DELETE', `/class-teacher-tenure/${id}`, null, headers);
  }
  
  for (const id of createdResources.classSubjects) {
    await makeRequest('DELETE', `/class-subject/${id}`, null, headers);
  }
  
  for (const id of createdResources.sectionTenures) {
    await makeRequest('DELETE', `/section-tenure/${id}`, null, headers);
  }
  
  for (const id of createdResources.classTenures) {
    await makeRequest('DELETE', `/class-tenure/${id}`, null, headers);
  }
  
  for (const id of createdResources.academicYears) {
    await makeRequest('DELETE', `/academic-year/${id}`, null, headers);
  }
  
  for (const id of createdResources.users) {
    await makeRequest('DELETE', `/user/${id}`, null, headers);
  }
  
  console.log('Cleanup complete');
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('\n\n========================================');
  console.log('          TEST REPORT');
  console.log('========================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} (${((testResults.passed / testResults.total) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${testResults.failed} (${((testResults.failed / testResults.total) * 100).toFixed(2)}%)`);
  
  console.log('\n--- Performance Summary ---');
  console.log(`Fast (<${PERFORMANCE_THRESHOLDS.FAST}ms): ${testResults.performance.fast.length}`);
  console.log(`Normal (${PERFORMANCE_THRESHOLDS.FAST}-${PERFORMANCE_THRESHOLDS.NORMAL}ms): ${testResults.performance.normal.length}`);
  console.log(`Slow (${PERFORMANCE_THRESHOLDS.NORMAL}-${PERFORMANCE_THRESHOLDS.SLOW}ms): ${testResults.performance.slow.length}`);
  console.log(`Very Slow (>${PERFORMANCE_THRESHOLDS.SLOW}ms): ${testResults.performance.verySlow.length}`);
  
  if (testResults.performance.verySlow.length > 0) {
    console.log('\n--- Very Slow Endpoints (>1000ms) ---');
    testResults.performance.verySlow.forEach(item => {
      console.log(`  [${item.category}] ${item.testName}: ${item.duration.toFixed(2)}ms`);
    });
  }
  
  if (testResults.performance.slow.length > 0) {
    console.log('\n--- Slow Endpoints (500-1000ms) ---');
    testResults.performance.slow.forEach(item => {
      console.log(`  [${item.category}] ${item.testName}: ${item.duration.toFixed(2)}ms`);
    });
  }
  
  if (testResults.errors.length > 0) {
    console.log('\n--- Failed Tests ---');
    testResults.errors.forEach(error => {
      console.log(`  [${error.category}] ${error.testName}`);
      console.log(`    Expected: ${error.expected}, Actual: ${error.actual}`);
      console.log(`    Status: ${error.status}`);
      console.log(`    Duration: ${error.duration.toFixed(2)}ms`);
      console.log(`    Data: ${JSON.stringify(error.data)}`);
    });
  }
  
  console.log('\n--- Results by Category ---');
  for (const [category, tests] of Object.entries(testResults.endpoints)) {
    const passed = tests.filter(t => t.passed).length;
    const total = tests.length;
    const avgDuration = tests.reduce((sum, t) => sum + t.duration, 0) / total;
    console.log(`  ${category}: ${passed}/${total} passed (${((passed / total) * 100).toFixed(2)}%) - Avg: ${avgDuration.toFixed(2)}ms`);
  }
  
  console.log('\n========================================\n');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Starting API Tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  try {
    await testAuthentication();
    await testAcademicYear();
    await testClassTenure();
    await testSectionTenure();
    await testClassSubject();
    await testStudentEnrollment();
    await testClassTeacherTenure();
    await testSubjectTeacherTenure();
    await testUserTenures();
    
    await cleanup();
    generateReport();
    
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
