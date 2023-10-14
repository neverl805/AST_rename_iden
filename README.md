# AST_rename_iden
js混淆变量名优化
// 变量名映射说明

// glb 全局变量
// loc 局部变量

// Exp_arg 函数表达式形参   function (Exp_arg){}

// Dec_arg 函数声明形参    function ab(Dec_arg){}

// Arr_arg 箭头函数形参   (Arr_arg)=>{}


let map_name = {
    CallExpression: 'call', // 函数调用 : a()
    
    MemberExpression: 'mem', // 对象属性 : a['b']
    
    StringLiteral: 'str', // 字符串 : '123'
    
    Identifier: 'id', //  变量 : abc
    
    AssignmentExpression: 'asgE', // 赋值 : a = b
    
    ExpressionStatement: 'exp', // 常规表达式 : 带;结尾的语句
    
    ObjectExpression: 'obj', // Object 对象 : {}
    
    NumericLiteral: 'num', // 数值 : 1
    
    ArrayExpression : 'array', // 数组 : []
    
    FunctionExpression: 'func', // 函数表达式 : function (a,b){}
    
    UnaryExpression: 'unary', // ![]
    
    ThisExpression: 'this', // this表达式 : this
    
    BinaryExpression: 'bin', // 运算表达式 : 1+2+3
    
    ConditionalExpression: 'cda', // 三元表达式 : a ? b:c
    
    ArrowFunctionExpression: 'arr_fun', // 箭头函数 : ()=>{}
    
    LogicalExpression : 'log', // 逻辑表达式 : a || b && c
    
    NewExpression: 'new', // new 表达式 : new a()
    
    BooleanLiteral:'bool', // 布尔值 : true false
    
    UpdateExpression:'up', // 自更新表达式 : i++
    
    AwaitExpression: 'await', // await 表达式 : await bc
    
    SequenceExpression: 'seq', // 逗号表达式 :  a,b,c,d
    
    RegExpLiteral: 'reg', // 正则表达式 : new RegEx
    
    NullLiteral: 'null', // null
    
    AssignmentPattern: 'asgP', // 赋值 : function (fm, DW = !0){}
}
