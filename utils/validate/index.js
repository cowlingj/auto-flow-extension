import djv from "djv";
import schema from "../schema.json";

const validator = new djv();
validator.addSchema("", schema);

export default function validate(flow) {
  const invalid = validator.validate("", flow);

  if (invalid) {
    throw new Error(
      JSON.stringify({ ...invalid, message: "validation failed" })
    );
  }
  return;
}
