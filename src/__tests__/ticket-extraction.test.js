const { extractTicketId, extractPrefixTicketId } = require('../index');

describe('Ticket ID Extraction Functions', () => {
  describe('extractTicketId - Regular ticket formats', () => {
    test('should extract SC-123 format', () => {
      expect(extractTicketId('SC-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug SC-456')).toBe('456');
      expect(extractTicketId('SC-789 Implement new feature')).toBe('789');
    });

    test('should extract sc-123 format (lowercase)', () => {
      expect(extractTicketId('sc-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug sc-456')).toBe('456');
      expect(extractTicketId('sc-789 Implement new feature')).toBe('789');
    });

    test('should extract SHORTCUT-123 format', () => {
      expect(extractTicketId('SHORTCUT-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug SHORTCUT-456')).toBe('456');
      expect(extractTicketId('SHORTCUT-789 Implement new feature')).toBe('789');
    });

    test('should extract shortcut-123 format (lowercase)', () => {
      expect(extractTicketId('shortcut-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug shortcut-456')).toBe('456');
      expect(extractTicketId('shortcut-789 Implement new feature')).toBe('789');
    });

    test('should extract SC123 format (no dash)', () => {
      expect(extractTicketId('SC123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug SC456')).toBe('456');
      expect(extractTicketId('SC789 Implement new feature')).toBe('789');
    });

    test('should extract sc123 format (no dash, lowercase)', () => {
      expect(extractTicketId('sc123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug sc456')).toBe('456');
      expect(extractTicketId('sc789 Implement new feature')).toBe('789');
    });

    test('should handle multiple ticket numbers (return first)', () => {
      expect(extractTicketId('SC-123 and SC-456')).toBe('123');
      expect(extractTicketId('Fix SC-789 and SC-101')).toBe('789');
    });

    test('should return null for invalid formats', () => {
      expect(extractTicketId('Add new feature')).toBeNull();
      expect(extractTicketId('Fix bug')).toBeNull();
      expect(extractTicketId('SC-')).toBeNull();
      expect(extractTicketId('SC-abc')).toBeNull();
      expect(extractTicketId('')).toBeNull();
    });

    test('should handle edge cases', () => {
      expect(extractTicketId('SC-0: Zero ticket')).toBe('0');
      expect(extractTicketId('SC-999999: Large number')).toBe('999999');
      expect(extractTicketId('  SC-123  : Whitespace  ')).toBe('123');
    });

    test('should extract bracketed [sc-1234] anywhere in title', () => {
      expect(extractTicketId('feat: test hotfix [sc-93630]')).toBe('93630');
      expect(extractTicketId('docs: update README [SC-1234] minor')).toBe('1234');
      expect(extractTicketId('[sc-42] chore: bump dep')).toBe('42');
    });

    test('should validate user-provided examples', () => {
      expect(extractTicketId('[Home][SC-94667] Fix: Prevent Blocking the Bottom Area by Footer')).toBe('94667');
      expect(extractTicketId('feat: [sc-80021] improve handling of dollar-like currencies')).toBe('80021');
      expect(extractTicketId('sc-89480 feat(feature): Support KMP LP')).toBe('89480');
      expect(extractTicketId('fix: Give flagged_address more priority for security scanning (#84563)')).toBe('84563');
    });

    test('should return null for user-provided invalid titles without tickets', () => {
      expect(extractTicketId('[KMP] fix  deeplink')).toBeNull();
      expect(extractTicketId('feat(place-order): fetch balance & update some UI')).toBeNull();
      expect(extractTicketId('Return copy button to home screen')).toBeNull();
      expect(extractTicketId('feat(perp): add basic models for place order')).toBeNull();
    });
  });

  describe('extractPrefixTicketId - Prefix-only formats', () => {
    test('should extract 1234: format', () => {
      expect(extractPrefixTicketId('1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('5678: Fix bug')).toBe('5678');
      expect(extractPrefixTicketId('999: Quick fix')).toBe('999');
    });

    test('should extract #1234: format', () => {
      expect(extractPrefixTicketId('#1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('#5678: Fix bug')).toBe('5678');
      expect(extractPrefixTicketId('#999: Quick fix')).toBe('999');
    });

    test('should extract sc-1234: format', () => {
      expect(extractPrefixTicketId('sc-1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('SC-5678: Fix bug')).toBe('5678');
      expect(extractPrefixTicketId('sc-999: Quick fix')).toBe('999');
    });

    test('should extract #sc-1234: format', () => {
      expect(extractPrefixTicketId('#sc-1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('#SC-5678: Fix bug')).toBe('5678');
      expect(extractPrefixTicketId('#sc-999: Quick fix')).toBe('999');
    });

    test('should extract [sc-1234]: format', () => {
      expect(extractPrefixTicketId('[sc-1234]: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('[SC-5678]: Fix bug')).toBe('5678');
      expect(extractPrefixTicketId('[sc-999]: Quick fix')).toBe('999');
    });

    test('should extract SC-123: format (valid prefix)', () => {
      expect(extractPrefixTicketId('SC-123: Add feature')).toBe('123');
      expect(extractPrefixTicketId('sc-456: Fix bug')).toBe('456');
      expect(extractPrefixTicketId('SHORTCUT-789: Implement feature')).toBe('789');
      expect(extractPrefixTicketId('shortcut-101: Quick fix')).toBe('101');
    });

    test('should handle whitespace variations', () => {
      expect(extractPrefixTicketId('  1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('  #1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('  sc-1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('  #sc-1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('  [sc-1234]: Add feature')).toBe('1234');
    });

    test('should return null for non-prefix formats', () => {
      expect(extractPrefixTicketId('Add feature SC-123')).toBeNull();
      expect(extractPrefixTicketId('Fix bug sc-456')).toBeNull();
    });

    test('should return null for invalid formats', () => {
      expect(extractPrefixTicketId('Add new feature')).toBeNull();
      expect(extractPrefixTicketId('Fix bug')).toBeNull();
      expect(extractPrefixTicketId('1234 Title')).toBeNull();
      expect(extractPrefixTicketId('1234')).toBeNull();
      expect(extractPrefixTicketId('')).toBeNull();
    });

    test('should handle edge cases', () => {
      expect(extractPrefixTicketId('0: Zero ticket')).toBe('0');
      expect(extractPrefixTicketId('999999: Large number')).toBe('999999');
      expect(extractPrefixTicketId('  [sc-123]: Whitespace  ')).toBe('123');
    });
  });
});
