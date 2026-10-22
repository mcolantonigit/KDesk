import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Sin `globals: true` Testing Library no limpia solo entre tests.
afterEach(cleanup);
