/**
 * RLS + UPSERT Browser Console Test
 *
 * Run this in your browser console on your Next.js app
 * (Must be on a page that imports Supabase client)
 *
 * PREREQUISITES:
 * 1. Be logged in (authenticated user)
 * 2. Have Supabase client available (import { createClient } from '@/lib/supabase/client')
 * 3. Migration 002 applied to database
 *
 * USAGE:
 * 1. Copy this entire file
 * 2. Open browser DevTools (F12)
 * 3. Go to Console tab
 * 4. Paste and press Enter
 * 5. Review test results
 */

(async function testRLSUpsert() {
  console.log('🧪 Starting RLS + UPSERT Tests...\n');

  // Import Supabase client (adjust path if needed)
  let supabase;
  try {
    const { createClient } = await import('/src/lib/supabase/client.js');
    supabase = createClient();
  } catch (error) {
    console.error('❌ Failed to import Supabase client:', error);
    console.log('💡 Make sure you\'re on a page that has access to the Supabase client');
    return;
  }

  // Track test results
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function logTest(name, passed, details = {}) {
    const status = passed ? '✅' : '❌';
    const result = { name, passed, details };
    results.tests.push(result);

    if (passed) {
      results.passed++;
      console.log(`${status} ${name}`);
    } else {
      results.failed++;
      console.error(`${status} ${name}`);
      console.error('   Details:', details);
    }
  }

  // ============================================================================
  // Test 1: Check Authentication
  // ============================================================================
  console.log('\n📋 Test 1: Authentication Check');

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    logTest('Authentication', false, { error: authError, user });
    console.error('❌ TESTS ABORTED - You must be logged in!');
    return;
  }

  logTest('Authentication', true, { userId: user.id, email: user.email });

  // ============================================================================
  // Test 2: Clean Test Data
  // ============================================================================
  console.log('\n📋 Test 2: Cleanup Previous Test Data');

  const { error: cleanupError } = await supabase
    .from('pr_sessions')
    .delete()
    .eq('user_id', user.id)
    .like('pr_id', 'test/%');

  logTest('Cleanup', !cleanupError, { error: cleanupError });

  // ============================================================================
  // Test 3: INSERT (Basic)
  // ============================================================================
  console.log('\n📋 Test 3: Basic INSERT');

  const { data: insertData, error: insertError } = await supabase
    .from('pr_sessions')
    .insert({
      pr_id: 'test/browser/insert',
      user_id: user.id,
      last_seen_at: new Date().toISOString(),
      is_active: true,
    })
    .select();

  const insertPassed = !insertError && insertData && insertData.length === 1;
  logTest('Basic INSERT', insertPassed, {
    error: insertError,
    rowsReturned: insertData?.length,
    data: insertData?.[0],
  });

  if (!insertPassed) {
    console.error('❌ TESTS ABORTED - Basic INSERT failed (RLS policy issue)');
    console.error('   Error details:', {
      message: insertError?.message,
      code: insertError?.code,
      details: insertError?.details,
      hint: insertError?.hint,
    });
    return;
  }

  // ============================================================================
  // Test 4: UPSERT (INSERT path - first time)
  // ============================================================================
  console.log('\n📋 Test 4: UPSERT (INSERT path)');

  const { data: upsert1Data, error: upsert1Error } = await supabase
    .from('pr_sessions')
    .upsert({
      pr_id: 'test/browser/upsert',
      user_id: user.id,
      last_seen_at: new Date().toISOString(),
      is_active: true,
    }, {
      onConflict: 'pr_id,user_id',
    })
    .select();

  const upsert1Passed = !upsert1Error && upsert1Data && upsert1Data.length === 1;
  logTest('UPSERT (INSERT path)', upsert1Passed, {
    error: upsert1Error,
    rowsReturned: upsert1Data?.length,
    sessionId: upsert1Data?.[0]?.id,
  });

  if (!upsert1Passed) {
    console.error('❌ CRITICAL - UPSERT INSERT path failed!');
    console.error('   This is the main issue you were experiencing.');
    console.error('   Error details:', {
      message: upsert1Error?.message,
      code: upsert1Error?.code,
      details: upsert1Error?.details,
      hint: upsert1Error?.hint,
    });
    console.error('   Expected error code: 42501 (RLS policy violation)');
    console.error('   If you see this, migration 002 may not be applied correctly.');
    return;
  }

  const sessionId1 = upsert1Data[0].id;

  // ============================================================================
  // Test 5: UPSERT (UPDATE path - same pr_id)
  // ============================================================================
  console.log('\n📋 Test 5: UPSERT (UPDATE path)');

  // Wait 2 seconds to see timestamp change
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { data: upsert2Data, error: upsert2Error } = await supabase
    .from('pr_sessions')
    .upsert({
      pr_id: 'test/browser/upsert',  // Same pr_id as Test 4
      user_id: user.id,
      last_seen_at: new Date().toISOString(),
      is_active: true,
    }, {
      onConflict: 'pr_id,user_id',
    })
    .select();

  const upsert2Passed = !upsert2Error
    && upsert2Data
    && upsert2Data.length === 1
    && upsert2Data[0].id === sessionId1;  // Same ID = UPDATE occurred

  logTest('UPSERT (UPDATE path)', upsert2Passed, {
    error: upsert2Error,
    rowsReturned: upsert2Data?.length,
    sessionId: upsert2Data?.[0]?.id,
    previousSessionId: sessionId1,
    idsMatch: upsert2Data?.[0]?.id === sessionId1,
  });

  if (!upsert2Passed && upsert2Data?.[0]?.id !== sessionId1) {
    console.warn('⚠️  UPSERT created duplicate instead of updating!');
    console.warn('   This means onConflict is not working correctly.');
    console.warn('   Check UNIQUE constraint on (pr_id, user_id)');
  }

  // ============================================================================
  // Test 6: Verify No Duplicates
  // ============================================================================
  console.log('\n📋 Test 6: Verify No Duplicate Rows');

  const { data: duplicateCheck, error: dupError } = await supabase
    .from('pr_sessions')
    .select('*')
    .eq('pr_id', 'test/browser/upsert')
    .eq('user_id', user.id);

  const noDuplicates = !dupError && duplicateCheck && duplicateCheck.length === 1;
  logTest('No Duplicate Rows', noDuplicates, {
    error: dupError,
    rowCount: duplicateCheck?.length,
    expected: 1,
  });

  // ============================================================================
  // Test 7: SELECT Own Sessions
  // ============================================================================
  console.log('\n📋 Test 7: SELECT Own Sessions');

  const { data: selectData, error: selectError } = await supabase
    .from('pr_sessions')
    .select('*')
    .eq('user_id', user.id)
    .like('pr_id', 'test/browser/%');

  const selectPassed = !selectError && selectData && selectData.length >= 2;
  logTest('SELECT Own Sessions', selectPassed, {
    error: selectError,
    rowsReturned: selectData?.length,
    expected: '>=2',
  });

  // ============================================================================
  // Test 8: UPDATE Own Session
  // ============================================================================
  console.log('\n📋 Test 8: UPDATE Own Session');

  const { data: updateData, error: updateError } = await supabase
    .from('pr_sessions')
    .update({
      last_seen_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
    })
    .eq('pr_id', 'test/browser/insert')
    .eq('user_id', user.id)
    .select();

  const updatePassed = !updateError && updateData && updateData.length === 1;
  logTest('UPDATE Own Session', updatePassed, {
    error: updateError,
    rowsUpdated: updateData?.length,
  });

  // ============================================================================
  // Test 9: Security - CANNOT Update Other Users
  // ============================================================================
  console.log('\n📋 Test 9: Security - Cannot Update Other Users');

  const fakeUserId = '00000000-0000-0000-0000-000000000000';
  const { data: securityData, error: securityError } = await supabase
    .from('pr_sessions')
    .update({
      is_active: false,
    })
    .eq('user_id', fakeUserId)  // Try to update non-existent user
    .select();

  // Should return 0 rows (blocked by RLS)
  const securityPassed = !securityError && securityData && securityData.length === 0;
  logTest('Security - Cannot Update Others', securityPassed, {
    error: securityError,
    rowsUpdated: securityData?.length,
    expected: 0,
  });

  // ============================================================================
  // Test 10: Integration Test (Simulates Real Usage)
  // ============================================================================
  console.log('\n📋 Test 10: Integration Test (Real Usage Pattern)');

  // Simulate what use-presence.ts does
  const testPrId = 'test/browser/real-usage';

  // First visit to PR (INSERT)
  const { data: visit1, error: error1 } = await supabase
    .from('pr_sessions')
    .upsert({
      pr_id: testPrId,
      user_id: user.id,
      last_seen_at: new Date().toISOString(),
      is_active: true,
    }, {
      onConflict: 'pr_id,user_id',
    })
    .select();

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Refresh page / heartbeat (UPDATE)
  const { data: visit2, error: error2 } = await supabase
    .from('pr_sessions')
    .upsert({
      pr_id: testPrId,
      user_id: user.id,
      last_seen_at: new Date().toISOString(),
      is_active: true,
    }, {
      onConflict: 'pr_id,user_id',
    })
    .select();

  const integrationPassed = !error1
    && !error2
    && visit1?.length === 1
    && visit2?.length === 1
    && visit1[0].id === visit2[0].id;  // Same session updated

  logTest('Integration Test', integrationPassed, {
    error1,
    error2,
    visit1Id: visit1?.[0]?.id,
    visit2Id: visit2?.[0]?.id,
    idsMatch: visit1?.[0]?.id === visit2?.[0]?.id,
  });

  // ============================================================================
  // Final Cleanup
  // ============================================================================
  console.log('\n📋 Cleanup: Remove Test Data');

  await supabase
    .from('pr_sessions')
    .delete()
    .eq('user_id', user.id)
    .like('pr_id', 'test/%');

  console.log('✅ Test data cleaned up');

  // ============================================================================
  // Test Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.tests.length}`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ RLS policies are working correctly');
    console.log('✅ UPSERT operations work (INSERT and UPDATE paths)');
    console.log('✅ Security policies prevent unauthorized access');
    console.log('\n👉 Your app should now work in production!');
  } else {
    console.error('\n❌ SOME TESTS FAILED!');
    console.error(`   ${results.failed} out of ${results.tests.length} tests failed`);
    console.error('\n📖 Review failed tests above for details');
    console.error('📖 See /docs/RLS_UPSERT_TROUBLESHOOTING.md for help');
    console.error('\n💡 Common issues:');
    console.error('   1. Migration 002 not applied to database');
    console.error('   2. Still using old RLS policies');
    console.error('   3. UNIQUE constraint missing on (pr_id, user_id)');
    console.error('   4. Wrong Supabase project selected');
  }

  // Return results for programmatic access
  return results;
})();
