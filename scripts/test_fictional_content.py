import unittest
from generate_fictional_content import generate_cases, OUTLINES

class FictionalContentTests(unittest.TestCase):
    def test_repeatable_and_distinct(self):
        first = generate_cases(42, 100)
        self.assertEqual(first, generate_cases(42, 100))
        self.assertNotEqual(first, generate_cases(43, 100))
        self.assertEqual(len({case["id"] for case in first["cases"]}), 100)

    def test_examples_are_separate_from_authority(self):
        for case in generate_cases(42, 10)["cases"]:
            self.assertTrue(case["fictional"])
            self.assertTrue(case["id"].startswith("EXAMPLE-"))
            self.assertNotIn("rewardCredits", case)
            self.assertNotIn("maid", case)
            self.assertEqual(len(case["sources"]), 3)
        self.assertEqual(len({outline["id"] for outline in OUTLINES}), len(OUTLINES))

if __name__ == "__main__":
    unittest.main()
