export default{
    type: 'object',
    properties:{
        name: {type: 'string', minLength: 1,},
        dueDate: {type: 'string' , minLength: 8}
    },
    required: ['name', 'dueDate']
} as const