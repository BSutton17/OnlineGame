import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount whatever the last test rendered so screens don't pile up.
afterEach(cleanup);
