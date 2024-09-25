import { type ZodObject, type ZodRawShape, z } from "zod";

export const instanceofZodType = (type: any): type is z.ZodTypeAny => {
  return !!type?._def?.typeName;
};

export const instanceofZodTypeKind = <Z extends z.ZodFirstPartyTypeKind>(
  type: z.ZodTypeAny,
  zodTypeKind: Z,
): type is InstanceType<(typeof z)[Z]> => {
  return type?._def?.typeName === zodTypeKind;
};

export const instanceofZodTypeOptional = (
  type: z.ZodTypeAny,
): type is z.ZodOptional<z.ZodTypeAny> => {
  return instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodOptional);
};

export const instanceofZodTypeObject = (
  type: z.ZodTypeAny,
): type is z.ZodObject<z.ZodRawShape> => {
  return instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodObject);
};

export type ZodTypeLikeVoid = z.ZodVoid | z.ZodUndefined | z.ZodNever;

export const instanceofZodTypeLikeVoid = (
  type: z.ZodTypeAny,
): type is ZodTypeLikeVoid => {
  return (
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodVoid) ||
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodUndefined) ||
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodNever)
  );
};

export const unwrapZodType = (
  type: z.ZodTypeAny,
  unwrapPreprocess: boolean,
): z.ZodTypeAny => {
  // TODO: Allow parsing array query params
  // if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodArray)) {
  //   return unwrapZodType(type.element, unwrapPreprocess);
  // }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodEnum)) {
    return unwrapZodType(z.string(), unwrapPreprocess);
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodNullable)) {
    return unwrapZodType(type.unwrap(), unwrapPreprocess);
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodBranded)) {
    return unwrapZodType(type.unwrap(), unwrapPreprocess);
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodOptional)) {
    return unwrapZodType(type.unwrap(), unwrapPreprocess);
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodDefault)) {
    return unwrapZodType(type.removeDefault(), unwrapPreprocess);
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodLazy)) {
    return unwrapZodType(type._def.getter(), unwrapPreprocess);
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodEffects)) {
    if (type._def.effect.type === "refinement") {
      return unwrapZodType(type._def.schema, unwrapPreprocess);
    }
    if (type._def.effect.type === "transform") {
      return unwrapZodType(type._def.schema, unwrapPreprocess);
    }
    if (unwrapPreprocess && type._def.effect.type === "preprocess") {
      return unwrapZodType(type._def.schema, unwrapPreprocess);
    }
  }
  return type;
};

type NativeEnumType = {
  [k: string]: string | number;
  [nu: number]: string;
};

export type ZodTypeLikeString =
  | z.ZodString
  | z.ZodOptional<ZodTypeLikeString>
  | z.ZodDefault<ZodTypeLikeString>
  | z.ZodEffects<ZodTypeLikeString, unknown, unknown>
  | z.ZodUnion<[ZodTypeLikeString, ...ZodTypeLikeString[]]>
  | z.ZodIntersection<ZodTypeLikeString, ZodTypeLikeString>
  | z.ZodLazy<ZodTypeLikeString>
  | z.ZodLiteral<string>
  | z.ZodEnum<[string, ...string[]]>
  | z.ZodNativeEnum<NativeEnumType>;

export const instanceofZodTypeLikeString = (
  _type: z.ZodTypeAny,
): _type is ZodTypeLikeString => {
  const type = unwrapZodType(_type, false);

  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodEffects)) {
    if (type._def.effect.type === "preprocess") {
      return true;
    }
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodUnion)) {
    return !type._def.options.some(
      (option) => !instanceofZodTypeLikeString(option),
    );
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodIntersection)) {
    return (
      instanceofZodTypeLikeString(type._def.left) &&
      instanceofZodTypeLikeString(type._def.right)
    );
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodLiteral)) {
    return typeof type._def.value === "string";
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodEnum)) {
    return true;
  }
  if (instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodNativeEnum)) {
    return !Object.values(type._def.values).some(
      (value) => typeof value === "number",
    );
  }
  return instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodString);
};

export const zodSupportsCoerce = "coerce" in z;

export type ZodTypeCoercible =
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodBigInt
  | z.ZodDate;

export const instanceofZodTypeCoercible = (
  _type: z.ZodTypeAny,
): _type is ZodTypeCoercible => {
  const type = unwrapZodType(_type, false);
  return (
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodNumber) ||
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodBoolean) ||
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodBigInt) ||
    instanceofZodTypeKind(type, z.ZodFirstPartyTypeKind.ZodDate)
  );
};

export const coerceSchema = (schema: ZodObject<ZodRawShape>) => {
  Object.values(schema.shape).forEach((shapeSchema) => {
    const unwrappedShapeSchema = unwrapZodType(shapeSchema, false);
    if (instanceofZodTypeCoercible(unwrappedShapeSchema))
      unwrappedShapeSchema._def.coerce = true;
    else if (instanceofZodTypeObject(unwrappedShapeSchema))
      coerceSchema(unwrappedShapeSchema);
  });
};
