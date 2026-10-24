import copy
import unittest
from mai_validation import validate
import json
from pathlib import Path

class Checks(unittest.TestCase):
    def example(self,kind):
        return json.loads((Path(__file__).parent / "examples" / f"{kind}.json").read_text())
    def test_valid_examples(self):
        for k in ["npc","mission","rewards"]:
            self.assertTrue(validate(k,self.example(k))["valid"])
    def test_unknown_npc(self):
        data=self.example("npc");data[0]["relationship_ids"]=["missing"]
        self.assertFalse(validate("npc",data)["valid"])
    def test_unknown_source(self):
        data=self.example("mission");data[0]["required_source_ids"]=["missing"]
        self.assertFalse(validate("mission",data)["valid"])
    def test_duplicate_entitlement(self):
        data=self.example("rewards");other=copy.deepcopy(data[0]);other["id"]="different";data.append(other)
        self.assertFalse(validate("rewards",data)["valid"])
    def test_separate_players(self):
        data=self.example("rewards");other=copy.deepcopy(data[0]);other.update(id="other",player_id="other");data.append(other)
        self.assertTrue(validate("rewards",data)["valid"])
    def test_bad_amount(self):
        for bad in [-1,True,1.5]:
            data=self.example("rewards");data[0]["credits"]=bad
            self.assertFalse(validate("rewards",data)["valid"])
    def test_malformed(self):
        for k in ["npc","mission","rewards"]:
            self.assertFalse(validate(k,{})["valid"])
            self.assertFalse(validate(k,[None])["valid"])
    def test_empty_mission(self):
        data=self.example("mission");data[0]["objective_ids"]=[]
        self.assertFalse(validate("mission",data)["valid"])

if __name__ == "__main__": unittest.main()
