import unittest
from build_broad_street import build, validate

class BroadStreetTests(unittest.TestCase):
    def test_generation_preserves_canonical_records_and_is_repeatable(self):
        first = build(42)
        self.assertEqual(first, build(42))
        varied = build(43)
        self.assertNotEqual(first['reference'], varied['reference'])
        self.assertEqual(first['sources'], varied['sources'])
        self.assertEqual(first['chronology'], varied['chronology'])
        self.assertTrue(validate(first))

    def test_public_page_contains_no_private_identity_or_lab_results(self):
        public = next(source for source in build()['sources'] if source['app'] == 'browser')
        for term in ['Silas Drake', 'EV-0010', 'EV-0011', 'CRUZ-9012', 'twelve trillion']:
            self.assertNotIn(term, public['body'])
        self.assertEqual(public['url'], 'https://firstfederal.aure/maintenance')

if __name__ == '__main__':
    unittest.main()
