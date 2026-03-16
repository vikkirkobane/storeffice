-- Test the specific function syntax that was causing issues
-- This is just a syntax test, not meant to be run on Supabase

-- Test the distance calculation formula syntax
DO $$
DECLARE
  test_result DOUBLE PRECISION;
BEGIN
  -- Test the corrected formula syntax
  SELECT SQRT(POW(69.1 * (10.0 - 5.0), 2) +
              POW(69.1 * (20.0 - 15.0) * COS(5.0 / 57.3), 2))
  INTO test_result;
  
  RAISE NOTICE 'Distance calculation test passed: %', test_result;
END $$;