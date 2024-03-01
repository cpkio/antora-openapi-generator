import OpenAPI from "npm:@readme/openapi-parser"

const shiftwidth = 2

type ObjectType = "boolean" | "integer" | "number" | "string" | "array" | "object"

type ObjectReturnType = [string[], string[]]

interface IObjectBase {
  type: ObjectType | ObjectType[]
  enum?: any[]
  const?: any
  nullable?: boolean
  default?: any
  deprecated?: boolean
  title?: string
  description?: string
  examples?: []
  toList(): ObjectReturnType
}

type ObjectAny = ObjectBoolean | ObjectNumber | ObjectString | ObjectArray | ObjectObject | ObjectOneOf | ObjectAllOf

function joinToString(list: string[], delimiter: string): string {
  list.push(delimiter)
  return list.join(delimiter)
}

function shift(list: string[], indent: number): string[] {
  if (indent < 0) { indent = 0 }
  const res: string[] = []
  list.forEach( (line) => {
    res.push(' '.repeat(indent * shiftwidth) + line)
  })
  return res
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface IObjectBoolean extends IObjectBase {
  type: "boolean"
}

class ObjectBoolean {
  // Свойства класса
  public type: "boolean" = "boolean"
  private entitled: boolean = true   // Возвращать ли имя параметра в текстовом представлении экземпляра класса

  // Свойства из спецификации
  private name: string            // Имя
  public description?: string     // Описание
  private default                 // Значение по умолчанию
  public require = false          // Является ли обязательным
  public nullable?: boolean       // Обнуляемый ли

  constructor(field: string, content: IObjectBoolean, required: boolean, titled?: boolean) {
    this.default = content?.default
    this.description = content?.description
    this.name = field
    this.nullable = content?.nullable

    this.entitled = titled ?? this.entitled

    this.require = required
  }

  get display() {
    return "true"
  }

  toList(last = false): ObjectReturnType {
    const _default = this.default ? `(по умолчанию ${this.default})` : ''
    const desc = this.description ? `${this.description}` : ''
    const nullable = this.nullable ? ' icon:ban[] ' : ''
    const req = this.require ? ' icon:check-circle[] ' : ''
    let _last = last ? '' : ','

    if (this.name && this.entitled) {
      if (!this.require && !this.description) {
        return [
          [`"${this.name}": ${this.display}${_last}\n`],
          []
        ]
      }
      else {
        return [
          [`"${this.name}": ${this.display}${_last} <.>\n`],
          [`<.> ${req} ${nullable} ${desc} ${_default}\n`]
        ]
      }
    }
    else {
      if (!this.require && !this.description) {
        return [
          [`${this.display}\n`],
          []
        ]
      }
      else {
        return [
          [`${this.display} <.>\n`],
          [`<.> ${req} ${nullable} ${desc} ${_default}\n`]
        ]
      }
    }
  }
}

interface IObjectNumber extends IObjectBase {
  type: "integer" | "number"
  minimum?: number
  maximum?: number
  format?: "int32" | "int64" |  "float" | "double"
  multipleOf?: number
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  enum?: number[]
}

class ObjectNumber {
  // Свойства класса
  public type: "integer" | "number" = "integer"
  private entitled: boolean = true

  // Свойства из спецификации
  public require = false          // Является ли обязательным
  private name: string            // Имя
  public description?: string    // Описание
  public maximum?: number
  public minimum?: number
  public format?: "int32" | "int64" | "float" | "double" = "int32"
  private default                 // Значение по умолчанию
  public nullable?: boolean       // Обнуляемый
  public enum?: number[]          // Список возможных значений

  constructor(field: string, content: IObjectNumber, required: boolean, titled?: boolean) {
    this.type = content.type
    this.format = content?.format
    this.default = content?.default
    this.description = content?.description
    this.enum = content?.enum
    this.maximum = content?.maximum
    this.minimum = content?.minimum
    this.name = field
    this.nullable = content?.nullable

    this.entitled = titled ?? this.entitled

    this.require = required
  }

  get display() {
    if (this.type === "number" && this.format === "float") {
      return this.default ?? "0.0"
    }
    if (this.type === "number" && this.format === "double") {
      return this.default ?? "0.00"
    }
    return "0"
  }

  toList(last = false): ObjectReturnType {
    const min = this.minimum ? ` от \`${this.minimum}\`` : '' 
    const max = this.maximum ? ` до \`${this.maximum}\`` : ''
    const desc = this.description ? `${this.description}` : ''
    const _default = this.default ? `(по умолчанию ${this.default})` : ''
    const nullable = this.nullable ? ' icon:ban[] ' : ''
    const req = this.require ? ' icon:check-circle[] ' : ''
    const enumerable = this.enum ? `возможные значения: ${this.enum.map((value)=> `\`${value}\``).join(', ')}` : ''
    let _last = last ? '' : ','

    if (this.name && this.entitled) {
      if (!this.require &&
          !this.description &&
          !this.minimum &&
          !this.maximum &&
          !this.enum) {
        return [
          [`"${this.name}": ${this.display}${_last}\n`],
          []
        ]
      }
      else {
        return [
          [`"${this.name}": ${this.display}${_last} <.>\n`],
          [`<.> ${req} ${nullable} ${desc} ${min} ${max} ${enumerable} ${_default}\n`]
        ]
      }
    }
    else {
      if (!this.require &&
          !this.description &&
          !this.minimum &&
          !this.maximum &&
          !this.enum) {
        return [
          [`${this.display}\n`],
          []
        ]
      }
      else {
        return [
          [`${this.display} <.>\n`],
          [`<.> ${req} ${nullable} ${desc} ${min} ${max} ${enumerable} ${_default}\n`]
        ]
      }
    }
  }
}

interface IObjectString extends IObjectBase {
  type: "string"
  minLength?: number
  maxLength?: number
  format?: "date-time" | "time" | "date" | "duration" | "email" | "hostname" | "ipv4" | "ipv6" | "uri" | "uuid" | "regex" | "password"
  pattern?: string
  contentEncoding?: string
  contentMediaType?: string
  enum?: string[]
}

class ObjectString {
  // Свойства класса
  public type: "string" = "string"
  private entitled: boolean = true   // Выводить ли имя параметра

  // Свойства из спецификации
  public require = false          // Обязательность
  private name: string            // Имя
  public description?: string    // Описание
  public maxLength?: number       //
  public minLength?: number       //
  private default                 // Значение по умолчанию
  public nullable?: boolean       // Обнуляемый
  public enum?: string[] = []     // Список значений
  private format?: "date-time" | "time" | "date" | "duration" | "email" | "hostname" | "ipv4" | "ipv6" | "uri" | "uuid" | "regex" | "password"

  constructor(field: string, content: IObjectString, required: boolean, titled?: boolean) {
    this.default = content?.default
    this.description = content?.description
    this.enum = content?.enum
    this.format = content?.format
    this.maxLength = content?.maxLength
    this.minLength = content?.minLength
    this.name = field
    this.nullable = content?.nullable

    this.entitled = titled ?? this.entitled

    this.require = required
  }

  get display() {
    // TODO: "date-time" | "time" | "date" | "duration" | "email" | "hostname" | "ipv4" | "ipv6" | "uri" | "uuid" | "regex" | "password" | "byte" | "binary"
    if (this.default) {
      return this.default
    }
    if (this.enum) {
      return this.enum[Math.floor(Math.random() * this.enum.length)]
    }
    if (this.format === 'date-time') {
      const d = new Date(Date.now())
      return d.toISOString()
    }
    if (this.format === 'email') {
      return 'email@example.com'
    }
    // Версия UUID, возвращаемая функцией, может не соответствовать требуемой по спецификации
    if (this.format === 'uuid') {
      return uuid()
    }
    return this.type
  }

  toList(last = false): ObjectReturnType {
    const _default = this.default ? `(по умолчанию ${this.default})` : ''
    const min = this.minLength ? ` от \`${this.minLength}\`` : '' 
    const max = this.maxLength ? ` до \`${this.maxLength}\`` : ''
    const prefix = this.minLength || this.maxLength ? ' длина ' : ''
    const desc = this.description ? ` ${this.description}` : ''
    const nullable = this.nullable ? ' icon:ban[] ' : ''
    const req = this.require ? ' icon:check-circle[] ' : ''
    const enumerable = this.enum ? `возможные значения: ${this.enum.map((value)=> `\`${value}\``).join(', ')}` : ''
    let _last = last ? '' : ','

    if (this.name && this.entitled) {
      if (!this.require &&
          !this.description &&
          !this.minLength &&
          !this.maxLength &&
          !this.enum) {
        return [
          [`"${this.name}": "${this.display}"${_last}\n`],
          []
        ]
      }
      else {
        return [
          [`"${this.name}": "${this.display}"${_last} <.>\n`],
          [`<.> ${req} ${nullable} ${desc} ${prefix} ${min} ${max} ${enumerable} ${_default}\n`]
        ]
      }
    }
    else {
      // Эта ветка означает, что возвращаемое содержимое будет вложено в [],
      // и нужно перед закрывающей ] сделать разрыв строки
      if (!this.require &&
          !this.description &&
          !this.minLength &&
          !this.maxLength &&
          !this.enum) {
        return [
          [`"${this.display}"\n`],
          []
        ]
      }
      else {
        return [
          [`"${this.display}" <.>\n`],
          [`<.> ${req} ${nullable} ${desc} ${prefix} ${min} ${max} ${enumerable} ${_default}\n`]
        ]
      }
    }
  }
}

interface IObjectArray extends IObjectBase {
  type: "array"
  items?
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  maxContains?: number
  minContains?: number
  additionalItems?
}

class ObjectArray {
  // Свойства класса
  public type: "array" = "array"
  public items: ObjectBoolean | ObjectNumber | ObjectString | ObjectArray | ObjectObject | ObjectAllOf | ObjectOneOf
  private text: string[] = []        //
  private info: string[] = []        //
  private entitled: boolean = true   //

  // Свойства из спецификации
  public require = false          //
  private name: string            //
  public description?: string     //
  public maxItems?: number        //
  public minItems?: number        //
  private default?                //
  public nullable?: boolean       //

  constructor(field: string, content: IObjectArray, required: boolean, titled?: boolean) {
    this.default = content?.default
    this.description = content?.description
    this.maxItems = content?.maxItems
    this.minItems = content?.minItems
    this.name = field
    this.nullable = content?.nullable
    this.entitled = titled ?? this.entitled

    this.require = required

    switch(content.items.type) {
      case "boolean": {
        this.items = new ObjectBoolean(null, content.items as object, false)
        return
        break
      }
      case "number": {
        this.items = new ObjectNumber(null, content.items as object, false)
        return
        break
      }
      case "integer": {
        this.items = new ObjectNumber(null, content.items as object, false)
        return
        break
      }
      case "string": {
        this.items = new ObjectString(null, content.items as object, false)
        return
        break
      }
      case "array": {
        this.items = new ObjectArray(null, content.items as object, false)
        return
        break
      }
      case "object": {
        this.items = new ObjectObject(null, content.items as object, false)
        return
        break
      }
      default: {
        break
      }
    }
    if (content.items?.allOf) { this.items = new ObjectAllOf(null, content.items); return }
    if (content.items?.oneOf) { this.items = new ObjectOneOf(null, content.items); return }
  }

  toList(last = false): ObjectReturnType {
    const min = this.minItems ? ` не менее \`${this.minItems}\`` : '' 
    const max = this.maxItems ? ` не более \`${this.maxItems}\`` : ''
    const prefix = this.minItems || this.maxItems ? ' элементов ' : ''
    const desc = this.description ? ` ${this.description} ` : ''
    const nullable = this.nullable ? ' icon:ban[] ' : ''
    const req = this.require ? ' icon:check-circle[] ' : ''

    if (this.name) {
      if (!this.description &&
          !this.minItems &&
          !this.maxItems) {
        this.text.push(`"${this.name}": [\n`)
      }
      else {
        this.text.push(`"${this.name}": [ <.>\n`)
        this.info.push(`<.> ${req} ${nullable} ${desc} ${prefix} ${min} ${max}\n`)
      }
    }
    else {
      if (!this.description &&
          !this.minItems &&
          !this.maxItems) {
        this.text.push(`[\n`)
      }
      else {
        this.text.push(`[ <.>\n`)
        this.info.push(`<.> ${req} ${nullable} ${desc} ${prefix} ${min} ${max}\n`)
      }
    }

    // Внутри списка всегда один элемент, поэтому он последний (true)
    const [parameter, comment] = this.items.toList(true)
    this.text = this.text.concat(shift(parameter,1))
    this.info = this.info.concat(comment)

    last ? this.text.push(`]\n`) : this.text.push(`],\n`)
    return [this.text, this.info]
  }
}

function resolvePropertiesList(prop: [string, { type: ObjectType, allOf?: object[], oneOf?: object[] }], required: string[]): ObjectAny | undefined {
  const k = prop[0]
  const v = prop[1]
  const isRequired = required?.includes(k) ?? false
  if (v?.allOf) {
    return new ObjectAllOf(k, v, isRequired)
  }

  if (v?.oneOf) {
    return new ObjectOneOf(k, v, isRequired)
  }
  switch(v?.type) {
    case "boolean": {
      return new ObjectBoolean(k as string, v as IObjectBoolean, isRequired)
      break
    }
    case "number": {
      return new ObjectNumber(k as string, v as IObjectNumber, isRequired)
      break
    }
    case "integer": {
      return new ObjectNumber(k as string, v as IObjectNumber, isRequired)
      break
    }
    case "string": {
      return new ObjectString(k as string, v as IObjectString, isRequired)
      break
    }
    case "array": {
      return new ObjectArray(k as string, v as IObjectArray, isRequired)
      break
    }
    case "object": {
      return new ObjectObject(k as string, v as IObjectObject, isRequired)
      break
    }
    default: {
      break
    }
  }
}

interface IObjectObject extends IObjectBase {
  type: "object"
  properties?: IObjectBase[]
  maxProperties?: number
  minProperties?: number
  required?: string[]
  dependentRequired?: object
  additionalProperties?
}

class ObjectObject {
  // Свойства класса
  public type: "object" = "object"
  public bodyparameters: (ObjectBoolean | ObjectNumber | ObjectString | ObjectArray | ObjectObject | ObjectOneOf | ObjectAllOf)[] = []
  private text: string[] = []     //
  private info: string[] = []     //
  private entitled: boolean = true   //

  // Свойства из спецификации
  private name: string            //

  // Объект — особый тип данных. У него самого нет признака обязательности,
  // а его required: список строк, соответствующих именам его дочерних
  // элементов. Поэтому его required обрабатывается или пробрасывается дальше.
  public require = false
  public description?: string     //
  private default
  public nullable?: boolean       //

  constructor(field: string, content: IObjectObject, required: boolean, titled?: boolean) {
    this.default = content?.default
    this.description = content?.description
    this.name = field
    this.nullable = content?.nullable
    this.entitled = titled ?? this.entitled
    this.require = required ?? this.require
    
    if (
      !content.properties &&
      !content.additionalProperties &&
      !content.allOf &&
      !content.oneOf &&
      !content.enum
    ) {
      // console.error(content)
      // throw new Error(`'${field}' object has no properties, additionalProperties or quantifier block`)
    }

    // let hasProperties = content?.properties ? true : false
    // let isPropertiesEmpty = hasProperties ? (Object.keys(content.properties).length > 0) : true
    const hasAddProperties = content?.additionalProperties ? true : false
    const isAddPropertiesEmpty = hasAddProperties ? (content.additionalProperties?.type ? false : true) : true

    // Если у объекта есть свойства, проходим по ним и задаем дочерним
    // объектам свойство обязательности
    if (content?.properties) {
      const req = content?.required ?? []
      const prop = content?.properties
      Object.entries(prop).forEach( (value) => {
        let obj = resolvePropertiesList(value, req)
        this.bodyparameters.push(obj)
      })
    }
    // Если у объекта есть дополнительные свойства
    if (!isAddPropertiesEmpty) {
      for(let i = 1; i < 4; i++) {
        this.bodyparameters.push(new ObjectObject('additionalProperty'+i, content.additionalProperties, false))
      }
    }
    // Если у объекта есть allOf / oneOf, когда он приходит от конструктора
    // объекта списка
    // Третьим параметром (required) мы ставим false, ибо никакой конкретный
    // параметр из возможных не может быть обязательным при выборе
    if(content?.oneOf) {
      this.bodyparameters.push(new ObjectOneOf(this.name, content, false))
    }
  }

  toList(last = false): ObjectReturnType {
    const n = this.name && this.entitled ? `"${this.name}": ` : ''
    // Если у объекта есть только nullable, выноску не делаем
    if (!this.description) {
      this.text.push(`${n}{\n`) // Сюда надо дописать <.> со свойствами объекта, они тоже могут быть
    }
    else {
      this.text.push(`${n}{ <.>\n`)
      const desc = this.description ? ` ${this.description} ` : ''
      const nullable = this.nullable ? ' icon:ban[] ' : ''
      const req = this.require ? ' icon:check-circle[] ' : ''
      this.info.push(`<.> ${req} ${nullable} ${desc}\n`)
    }

    let paramblock: string[] = []
    this.bodyparameters.forEach( (value, idx, all) => {
      const isLast = !(idx < (all.length - 1))
      const [parameter, comment] = value.toList(isLast) // parameter, comment = string[]
      const callout = comment.length > 0 ? ' <.>' : ''
       
      parameter.forEach( (v) => {
        paramblock = paramblock.concat(v)
      })
      this.info = this.info.concat(comment)
    })
    this.text = this.text.concat(shift(paramblock, 1))
    last ? this.text.push(`}\n`) : this.text.push(`},\n`)

    return [this.text, this.info]
  }
}

interface IObjectAllOf extends IObjectBase {
  allOf: ObjectAny[]
}

class ObjectAllOf {
  public type: 'allOf' = 'allOf'
  private name: string            // Имя
  public description?: string     // Описание
  private default                 // Значение по умолчанию
  public nullable?: boolean       // Обнуляемый ли

  private entitled = true

  public allOf: ObjectAny
  private text: string[] = []     //
  private info: string[] = []     //
 
  // TODO Ниже мы проверяем в content наличие и AllOf, и properties
  constructor(field: string, content: object, required: boolean, titled?: boolean) {
    this.name = field
    this.nullable = content?.nullable
    this.default = content?.default
    this.description = content?.description
    this.entitled = titled ?? this.entitled

    if(!content.allOf) { throw new Error('ObjectAllOf class cannot be instantiated: has no "allOf" field') } // Если в переданном содержимом нет allOf, ошибка

    let _allOfAreObjects = content.allOf.reduce( (accumulator, current) => accumulator || (current.type === "object"), false) // Проверяем, все ли элементы allOf являеются объектами

    // Формируем общий перечень всех обязательных полей как для объектов
    // allOf, так и родительского объекта. Формировать его как можно раньше
    // необходимо, ибо без него конструкторы объектов не поймут, что поле
    // обязательное
    let _required = content.allOf.reduce( (accumulator, current) => 
      current?.required ? accumulator.concat(current.required) : null ,
      []
    )
    if (content?.required) { _required = _required.concat(content.required) }


    if (_allOfAreObjects) { // Если да, работаем: объединяем между собой все элементы объектов…
      let _tmp = []
      content.allOf.forEach( (value) => {
        if (value.type === "object") {
          Object.entries(value.properties).forEach( (param) => {
            _tmp.push(
              resolvePropertiesList(param, _required)
            )
          })
        }
      })

      if (content?.properties) { // … и добавляем собственные свойства объекта, если они завалялись
        Object.entries(content.properties).forEach( (param) =>{
          _tmp.push(
            resolvePropertiesList(param, _required)
          )
        })
      }

      let _tmpobj = new ObjectObject(this.name, {}, required ?? false, this.entitled) // Создаем новый ObjectObject и кладем его в allOf
      _tmpobj.bodyparameters = _tmp
      _tmpobj.nullable = this.nullable
      _tmpobj.description = this.description
      this.allOf = _tmpobj
    }
    
    if (content.allOf.length > 1 && !_allOfAreObjects) { // Если разнородность в списке allOf, то ошибка
      throw new Error('allOf list has non-uniform object types')
      // смысл allOf в том, что результирующий объект должен одновременно
      // удовлетворять всем требованим для каждого объекта, это такое
      // логическое И однако строка не может сочетаться с object как
      // удовлетворяющий обоим требованиям тип (строка и объект не совместимы)
    }

    if (content.allOf.length == 1) { // Если в списке всего один элемент, то берём его как основу
      let _singleAllOf = content.allOf[0]

      _singleAllOf.nullable = this.nullable
      _singleAllOf.default = this.default
      _singleAllOf.description = this.description
      // _singleAllOf.require = this.require
      this.allOf = resolvePropertiesList([this.name, _singleAllOf],[])
    }
  }

  toList(last = false): ObjectReturnType {
    // this.allOf.forEach( (value, idx, all) => {
      const [parameter, comment] = this.allOf.toList(last)
      this.text = this.text.concat(parameter)
      this.info = this.info.concat(comment)
    // })
    return [
      this.text,
      this.info
    ]
  }
}

interface IObjectOneOf extends IObjectBase {
  oneOf: ObjectAny[]
}

class ObjectOneOf {
  public type: 'oneOf' = 'oneOf'
  private name: string            // Имя
  public description?: string     // Описание
  private default                 // Значение по умолчанию
  public require = false          // Является ли обязательным
  public nullable?: boolean       // Обнуляемый ли

  private entitled = true

  public oneOf: ObjectObject[] = []
  private text: string[] = []     //
  private info: string[] = []     //
 
  // 10.01.2024 23:59 Я полагаю, нужно и здесь передавать полностью объект,
  //    в котором содержится oneOf / anyOf, чтобы извлекать из него смежные
  //    с ними свойства, напр. requiere
  constructor(field: string, content: object, required: boolean, titled?: boolean) {
    this.name = field
    this.nullable = content?.nullable
    this.default = content?.default
    this.description = content?.description
    this.entitled = titled ?? this.entitled
    this.require = required ?? this.require

    if(!content) { throw new Error('ObjectOneOf class cannot be instantiated: has no "oneOf" field') }

    // Возможно, что бросание ошибки на все объекты кроме object не является
    // правильным, и альтернативой для поля могут быть любые типы данных
    content.oneOf.forEach( (value) => {
      // if(value.type !== "object") { throw new Error('oneOf type can be "object" only') }
      this.oneOf.push(
        resolvePropertiesList([null, value], [])
      )
    })
  }

  toList(last = false): ObjectReturnType {
    this.oneOf.forEach( (value, idx, all) => {
      const isLast = !(idx < (all.length - 1))
      const [parameter, comment] = value.toList(isLast)
      this.text = this.text.concat(parameter)
      !isLast ? this.text.push('// либо\n') : null
      this.info = this.info.concat(comment)
    })
    return [
      this.text,
      this.info
    ]
  }
}

class RequestBody {
  private name: string
  public requests: ObjectObject | ObjectArray
  private text: string[] = []
  private comments: string[] = []
  
  constructor(application: string, data: object) {
    if (!data.schema.type && !data.schema.allOf) { throw new Error('RequestBody: Cannot determine root object type: no type, no allOf/oneOf/anyOf') }

    // Если объект, итерируемся
    // У корневых объектов обязательность не показываем
    if (data.schema.type == "object"){
      this.requests = new ObjectObject(null, data.schema as IObjectObject, false, false)
    }
    if (data.schema.type == "array"){
      this.requests = new ObjectArray(null, data.schema?.items as IObjectArray, false, false)
    }
    if (data.schema.allOf){
      this.requests = new ObjectAllOf(null, data.schema, false, false)
    }
    if (data.schema.oneOf){
      this.requests = new ObjectOneOf(null, data.schema, false, false)
    }

    this.name = application
  }

  toList() {
    this.text.push(`\n.Схема тела запроса (\`${this.name}\`)\n`)
    this.text.push('[source,json]\n')
    this.text.push('----\n')
    const [parameter, comment] = this.requests.toList(true)
    this.text = this.text.concat(parameter)
    this.comments = this.comments.concat(comment)
    this.text.push('\n----\n')
    this.text = this.text.concat(this.comments)
    return this.text
  }

}

interface IParameter {
  name: string
  in: "query" | "header" | "path" | "cookie"
  description?: string
  required?: boolean
  deprecated?: boolean
  schema?: { type: ObjectType }
  content?
  example?
  examples?
}

// TODO Строго говоря, в параметрах запроса и в requestBody находятся одни
// и те же объекты Schema Object. Нужно превратить классы BodyParameter*
// в объекты схемы и переиспользовать их здесь
class Parameter {
  public name: string
  public in: "query" | "header" | "path" | "cookie"
  public description?: string
  public type: ObjectType
  private format?: string
  private default
  public require: boolean = false
  private schema: ObjectAny
  private inset = false // является ли этот параметр вложенным в другую таблицу
  
  private text: string[] = []
  private req: string[] = []

  // При итерации по списку параметров в качестве имени передается его номер
  constructor(parameterData: IParameter, inset: boolean) {
    this.require = parameterData?.required ?? false
    this.name = parameterData.name ?? null
    this.in = parameterData.in ?? null
    this.description = parameterData.description ?? ''
    this.inset = inset ?? this.inset

    // Тут нужно переделывать, ибо я хочу, чтобы внутри параметра жил Schema
    // Object, у которого уже есть всё что нужно
    // Непосредственно в объекте параметра type и default жить не могут, это
    // свойство Schema Object или .content/media-type
    this.schema = resolvePropertiesList([this.name, parameterData.schema], [])
  }

  toList() {
    const _default = this.schema?.default !== undefined ? `${this.schema.default.toString()}`: '' // здесь был баг, связанный с тем, что у boolean-параметра может быть значение false, и конструкция не срабатывала
    const desc = this.description ? `${this.description}`: ''
    const enumerable = this.schema.enum ? `возможные значения: ${this.schema.enum.map((value)=> `\`${value}\``).join(', ')}` : ''
    if (this.require) {
      this.req.push(`${this.name}\n`)
    }
    if (this.inset) {
      this.text.push(`! ${this.schema.type}\n`)
      this.text.push(`! ${this.name}\n`)
      this.text.push(`! ${_default}\n`)
      this.text.push(`! ${desc} ${enumerable}\n`)
    } else {
      this.text.push(`| ${this.schema.type}\n`)
      this.text.push(`| ${this.name}\n`)
      this.text.push(`| ${_default}\n`)
      this.text.push(`| ${desc} ${enumerable}\n`)
    }
    return [this.text, this.req]
  }

}

class Parameters {
  private parent: "parameters" = "parameters"
  private content: object
  private pathParameters: Parameter[] = []
  private queryParameters: Parameter[] = []
  private headerParameters: Parameter[] = []
  private cookieParameters: Parameter[] = []
  private text: string[] = []
  private req: string[] = []

  constructor(parent: "parameters", data: object, commonParameters) {
    this.content = data
    commonParameters?.forEach( (value) => {
      if (value.in === "query") {
        this.queryParameters.push(
          new Parameter( value as object)
        )
      }
      if (value.in === "header") {
        this.headerParameters.push(
          new Parameter(value as object)
        )
      }
      if (value.in === "path") {
        this.pathParameters.push(
          new Parameter(value as object)
        )
      }
      if (value.in === "cookie") {
        this.cookieParameters.push(
          new Parameter(value as object)
        )
      }
    })
    this.content.forEach( (value) => {
      if (value.in === "query") {
        this.queryParameters.push(
          new Parameter(value as object)
        )
      }
      if (value.in === "header") {
        this.headerParameters.push(
          new Parameter(value as object)
        )
      }
      if (value.in === "path") {
        this.pathParameters.push(
          new Parameter(value as object)
        )
      }
      if (value.in === "cookie") {
        this.cookieParameters.push(
          new Parameter(value as object)
        )
      }
    })
  }

  paramTable(params: Parameter[]) {
      const tid = `req_${uuid()}`
      this.text.push(`[%header,cols="10e,20m,10m,60a",id="${tid}"]\n`)
      this.text.push('|===\n')
      this.text.push('| Тип\n')
      this.text.push('| Имя\n')
      this.text.push('| По умолчанию\n')
      this.text.push('| Описание\n\n')
      Object.entries(params).forEach( (value) => {
        const [a, b] = value[1].toList()
        this.text = this.text.concat(a)
        if (b.length > 0) {
          this.req = this.req.concat(b)
        }
      })
      this.text.push('\n|===\n\n')
      if (this.req.length > 0) {
        this.text.push(`\n[.req, id="${tid}"]\n`)
        this.text = this.text.concat(this.req)
      }
  }

  toList() {
    if (this.pathParameters.length) {
      this.text.push('\n[caption=]\n.Параметры в пути эндпоинта\n')
      this.paramTable(this.pathParameters)
    }

    if (this.queryParameters.length) {
      this.text.push('\n[caption=]\n.Параметры в строке запроса\n')
      this.paramTable(this.queryParameters)
    }

    if (this.headerParameters.length) {
      this.text.push('\n[caption=]\n.Параметры в заголовках\n')
      this.paramTable(this.headerParameters)
    }

    if (this.cookieParameters.length) {
      this.text.push('\n[caption=]\n.Параметры в cookie\n')
      this.paramTable(this.cookieParameters)
    }

    return this.text
  }

}

class Headers {
  private headers: Parameter[] = []
  private req: string[] = []
  public text: string[] = []

  constructor(headers: object) {
    Object.entries(headers).forEach( (header) => {
      const param = Object.assign({}, header[1], { name: header[0] })
      this.headers.push( new Parameter(param, true) )
    })
  }

  toList() {
    const tid = `req_${uuid()}`
    this.text.push('\n\n.Заголовки\n')
    this.text.push(`[%header,cols="10e,20m,10m,60a",id="${tid}"]\n`)
    this.text.push('!===\n')
    this.text.push('! Тип\n')
    this.text.push('! Имя\n')
    this.text.push('! По умолчанию\n')
    this.text.push('! Описание\n\n')
    Object.entries(this.headers).forEach( (value) => {
      const [a, b] = value[1].toList()
      this.text = this.text.concat(a)
      if (b.length > 0) {
        this.req = this.req.concat(b)
      }
    })
    this.text.push('\n!===\n\n')
    if (this.req.length > 0) {
      this.text.push(`\n[.req, id="${tid}"]\n`)
      this.text = this.text.concat(this.req)
    }
    return this.text
  }
}

class Response {
  private httpcode: string
  private content: object
  private headers: Headers
  private description: string
  public responseTypes: [string, (ObjectObject|ObjectArray)][] = []

  private text: string[] = []
  private comments: string[] = []

  constructor(httpcode: string, data: object) {
    this.httpcode = httpcode
    this.content = data
    this.description = this.content.description ?? null
    
    if (this.content?.content) {
      Object.entries(this.content.content).forEach( (app) => {
        const application = app[0]
        const schema = app[1].schema ?? {}
        const req = app[1].schema?.required
        if (schema?.type === "object") {
          this.responseTypes.push([application, new ObjectObject(null, schema as object, false, false)])
        }
        if (schema?.type === "array") {
          this.responseTypes.push([application, new ObjectArray(null, schema as object, false, false)])
        }
      })
    }

    if (this.content?.headers) {
      this.headers = new Headers(this.content.headers)
    }

  }

  toList() {
    this.text.push(`| ${this.httpcode}\n`)
    this.text.push(`| ${this.description}\n`)

    this.text = this.text.concat(this.headers?.toList())

    if (this.responseTypes.length > 1) {
      this.text.push('\n[tabs]\n=====\n')

      this.responseTypes.forEach( (value) => {
        this.text.push(`\n${value[0]}:::\n`)
        this.text.push('+\n')
        this.text.push('[source,json]\n')
        this.text.push('----\n')
        const [parameter, comment] = value[1].toList(true)
        this.text = this.text.concat(parameter)
        this.comments = comment
        this.text.push('\n----\n')
        this.text = this.text.concat(this.comments)
      })
      this.text.push('\n=====\n')
    }
    else {
      this.responseTypes.forEach( (value) => {
        this.text.push(`\n.${value[0]}\n`)
        this.text.push('[source,json]\n')
        this.text.push('----\n')
        const [parameter, comment] = value[1].toList(true)
        this.text = this.text.concat(parameter)
        this.comments = comment
        this.text.push('\n----\n')
        this.text = this.text.concat(this.comments)
      })
    }

    return this.text
  }
  
}

class Responses {
  private parent: "responses" = "responses"
  private content: object
  private responses: Response[] = []
  private text: string[] = []

  constructor(parent: "responses", data: object) {
    this.content = data
    Object.entries(this.content).forEach( (value) => {
      let httpcode = value[0]
      let isHttp = (options.httpcodes && options.httpcodes.length > 0) ? options.httpcodes.some( (value) => { return options.httpcodes.includes( httpcode ) }) : true
      if (isHttp) {
        this.responses.push(
          new Response(httpcode as string, value[1] as object)
        )
      }
    })
  }

  toList() {
    this.text.push('\n[caption=]\n.Ответы\n')
    this.text.push('[%header,cols="1s,5a"]\n')
    this.text.push('|===\n')
    this.text.push('| Код ответа\n')
    this.text.push('| Описание\n')
    this.responses.forEach( (value) => {
      this.text = this.text.concat(value.toList())
    })
    this.text.push('|===\n\n')
    return this.text
  }
  
}

function hasAnythingToShow(obj: Method): boolean {
  return (
      (options?.parameters !== false &&
        (
          obj.parameters?.pathParameters.length > 0 ||
          obj.parameters?.queryParameters.length > 0 ||
          obj.parameters?.headerParameters.length > 0 ||
          obj.parameters?.cookieParameters.length > 0
        )
      ) ||
      (options?.responses !== false && obj.responses.responses?.length > 0) ||
      (options?.requestBodies !== false && obj.requestbodies.length > 0)
    ) &&
    !obj.deprecated
}

class Method {
  private endpoint: string
  private content: object
  private method: string
  private summary: string
  private operationId: string
  private description: string
  public requestbodies: RequestBody[] = []
  public deprecated: boolean = false
  public parameters: Parameters
  public responses: Responses
  public tags?: string[]

  private text: string[] = []
  
  constructor(method: string, content: object, endpoint: string, commonParameters) {
    this.method = method
    this.operationId = content?.operationId
    this.content = content
    this.endpoint = endpoint
    this.summary = this.content.summary
    this.description = this.content.description
    this.deprecated = this.content.deprecated
    this.tags = this.content?.tags

    Object.entries(this.content).forEach( (value) => {
      switch(value[0]) {
        case "parameters": {
          this.parameters = new Parameters(value[0], value[1], commonParameters)
          break
        }
        case "responses": {
          this.responses = new Responses(value[0], value[1])
          break
        }
        default: {
          break
        }
      }
    })

    // Форматов запроса может быть несколько, заполняем this.requestbodies[]
    // объектами, каждый из которых соответствует формату
    if (this.content.requestBody?.content) {
      Object.entries(this.content.requestBody.content).forEach( (value) => {
        const application = value[0]
        const v = value[1]
        this.requestbodies.push(new RequestBody(application as string, v as object))
      })
    }
  }

  toList() {
    const spl = this.endpoint.split('/')
    this.text.push(`\n\n[#${this.operationId}-${uuid()}]\n`)
    if (options?.headers === undefined || options?.headers == true) {
      this.text.push(`== `)
      this.text.push(`${this.summary}`)
      if (this.deprecated) { this.text.push(' (удален)') }
      this.text.push('\n\n')
    }
    if (hasAnythingToShow(this) && options?.collapsible == true) {
      this.text.push('.')
    }
    if (options?.labels) {
      options.labels.forEach( (value) => {
        this.text.push(`{empty} [.tag]#${value}# `)
      })
    }
    // this.text.push(`\n// tag::${spl[spl.length-1]}[]\n\n`)
    return this.text
  }

}

// Спецификация OAS предусматривает блок parameters в том числе и для
// эндпоинта в целом; параметры в этом блоке применяются ко всем операциям
// этого эндпоинта
class Path {
  public endpoint: string
  private content: object
  private methods: Method[] = []
  private text: string[] = []
  private commonParameters            // список объектов
  
  constructor(parent: string, path: object) {
    this.endpoint = parent
    this.content = path
    if (this.content?.parameters) { // Общие параметры для всех эндпоинтов
      this.commonParameters = this.content.parameters
    }
    Object.entries(this.content).forEach( (value) => {
      let method = value[0]
      let tags = value[1].tags ?? []
      let operationId = value[1].operationId
      let isMethod = (options.methods && options.methods.length > 0) ? options.methods.some( (value) => { return options.methods.includes( method ) }) : true
      let isOperationId = (options.operationIds && options.operationIds.length > 0) ? options.operationIds.some( (value) => { return options.operationIds.includes( operationId ) }) : true
      let isTag = (options.tags && options.tags.length > 0) ? options.tags.some( (value) => { return tags.includes( value ) }) : true
      if (isMethod && isOperationId && isTag) {
        this.methods.push(
          new Method(method as string, value[1] as object, this.endpoint, this.commonParameters)
        )
      }
    })
  }

  escape(str: string): string {
    return str.replace('{', '\\{').replace('}', '\\}')
  }

  toList() {
    this.methods.forEach( (value) =>
      {
        this.text = this.text.concat(value.toList())
        this.text.push(`{empty} [.${value.method.toLowerCase()}]#${this.escape(this.endpoint)}#`)
        if (value.deprecated) this.text.push(' icon:times-circle[]')
        if (hasAnythingToShow(value)) {
          if (options?.collapsible) {
            this.text.push('\n[%collapsible]\n')
            this.text.push('======\n')
          }

          if (value.description && !options?.tabbed) {
            this.text.push('\n\n')
            this.text.push(`${value.description}`)
            this.text.push('\n\n')
          }
          // if (options?.headers === false) {
          //     this.text.push(` (${value.summary})`);
          // }
          this.text.push('\n')

          if (options?.tabbed) {
            this.text.push('\n[tabs]\n')
            this.text.push('======\n')
            this.text.push('\nЗапрос::\n+\n--\n')
          }
          if ((options?.requestBodies === undefined || options?.requestBodies == true) && value.requestbodies.length > 0) {
            value.requestbodies.forEach( (v) => {
              this.text = this.text.concat(v.toList())
            })
          }
          if ((options?.parameters === undefined || options?.parameters == true) && value.parameters) {
            this.text.push(`\n\ninclude::partial$${value.operationId}-request-pre.adoc[opts="optional"]\n\n`)
            this.text = this.text.concat(value.parameters.toList())
          }
          if (
            (options?.parameters === undefined || options?.parameters == true) ||
            (options?.requestBodies === undefined || options?.requestBodies == true)
          ) {
            this.text.push(`\n\ninclude::partial$${value.operationId}-request-post.adoc[opts="optional"]\n\n`)
          }
          if (options?.tabbed) {
            this.text.push('\n--\n')
          }
          if (options?.tabbed) {
            this.text.push('\nОтвет::\n+\n--\n')
          }
          if ((options?.responses === undefined || options?.responses == true) && value.responses) {
            this.text.push(`\n\ninclude::partial$${value.operationId}-response-pre.adoc[opts="optional"]\n\n`)
            this.text = this.text.concat(value.responses.toList())
          }
          if (options?.responses === undefined || options?.responses == true) {
            this.text.push(`\n\ninclude::partial$${value.operationId}-response-post.adoc[opts="optional"]\n\n`)
          }
          if (options?.tabbed) {
            this.text.push('\n--\n')
          }
          if (options?.collapsible || options?.tabbed) {
            this.text.push('======\n')
          }
        }
      }
    )

    return this.text
  }

}

class Paths {
  private parent: string
  private content: object
  private children: Path[] = []
  
  private text: string[] = []

  constructor(parent: string, paths: object) {
    this.parent = parent
    this.content = paths
    Object.entries(this.content).forEach( (value) => {
      let endpoint = value[0]
      let a = (options.pathContains && options.pathContains.length > 0) ? options.pathContains.some( (strInclude) => { return endpoint.includes(strInclude) }) : true
      let b = (options.pathEndsWith && options.pathEndsWith.length > 0) ? options.pathEndsWith.some( (strEnd) => { return endpoint.endsWith(strEnd) }) : true
      if (a && b) {
        this.children.push(
          new Path(endpoint as string, value[1] as object)
        )
      }
    })
  }

  // Посколько этот класс предоставляет на выход текстовое содержимое,
  // ему не нужен .toList()
  toString() {
    this.children.forEach( (value) =>
      this.text = this.text.concat(value.toList())
    )
    return joinToString(this.text, '')
  }
}

let options = {}
