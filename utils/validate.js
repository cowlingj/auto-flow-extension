import djv from "djv";
import schema from './schema'

const validator = new djv()
validator.addSchema('root', schema)
export default function validate(json) {
  const invalid = validator.validate('root', json)
  if (invalid) {
    throw new Error(invalid)
  }
  return
}