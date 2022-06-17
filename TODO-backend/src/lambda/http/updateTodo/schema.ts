export default{
    type: 'object',
    properties:{
        name: {type: 'string', minLength: 1,},
        dueDate: {type: 'string' , minLength: 8},
        done: {type: 'boolean'}
    },
    required: ['name', 'dueDate', 'done']
} as const