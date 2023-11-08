const {parse} = require("@babel/parser");
const generator = require("@babel/generator").default
const traverse = require("@babel/traverse").default
const types = require("@babel/types")
const fs = require("fs");

// 还原初始化为常量且始终未修改的变量

console.time('还原完毕-->耗时')
let code = fs.readFileSync('test.js','utf-8')


// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
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

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// 缓存字典
var cache_array = {

}

// 如果是1 ，则替换变量名长度为1的
// var detect_name = 1 // 过滤变量名特征 ，只对含有这个字符串的变量名进行替换
var detect_name = '_0x' //

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
const dectet_node = {
    VariableDeclarator(path){
        let {scope,node} = path;
        if (!types.isIdentifier(node.id))return ;
        let name = node.id.name

        // console.log(path+'')
        if (name.indexOf('loc') !== -1 || name.indexOf('glb') !== -1)return ;
        if ((typeof detect_name !== 'number' && detect_name !== '' && name.indexOf(detect_name) === -1) && (detect_name !== name.length))return ;

        let bing = scope.getBinding(name)

        let new_name;
        let count = 0;

        if (this.dec_scope === 'glb'){
            if (!bing) {
                new_name = this.dec_scope + path.scope.generateUidIdentifier(this.kind).name;
            }
            else{
                if (node.init){
                    new_name = this.dec_scope + scope.generateUidIdentifier(map_name[node.init.type]).name;
                }
                else if (bing.referencePaths[0] &&
                    map_name[bing.referencePaths[0].parentPath.type]){

                    new_name = this.dec_scope + "_" + scope.generateUidIdentifier(map_name[bing.referencePaths[0].parentPath.type]).name;
                }
                else if (bing.referencePaths.length > 1 &&
                    map_name[bing.referencePaths[1].parentPath.type]){
                    new_name = this.dec_scope + "_" + scope.generateUidIdentifier(map_name[bing.referencePaths[1].parentPath.type]).name;
                }
                else if (
                    bing.constantViolations[0] &&
                    types.isAssignmentExpression(bing.constantViolations[0]) &&
                    map_name[bing.constantViolations[0].node.right.type]
                ){
                    new_name = this.dec_scope + "_" + scope.generateUidIdentifier(map_name[bing.constantViolations[0].node.right.type]).name;
                }
                else{
                    new_name = this.dec_scope + scope.generateUidIdentifier(this.kind).name;
                }
            }
        }
        else{
            if (!bing) {
                new_name = this.dec_scope + '_' +this.kind;
            }
            else{
                if (node.init){
                    // console.log(node.init.type)
                    new_name = this.dec_scope + "_" + map_name[node.init.type];
                }
                else if (bing.referencePaths[0] &&
                    map_name[bing.referencePaths[0].parentPath.type]){

                    new_name = this.dec_scope + "_" + map_name[bing.referencePaths[0].parentPath.type];
                }
                else if (bing.referencePaths.length > 1 &&
                    map_name[bing.referencePaths[1].parentPath.type]){
                    new_name = this.dec_scope + "_" + map_name[bing.referencePaths[1].parentPath.type];
                }
                else if (bing.constantViolations[0] &&
                    types.isAssignmentExpression(bing.constantViolations[0]) &&
                    map_name[bing.constantViolations[0].node.right.type]
                ){
                    new_name = this.dec_scope + "_" + map_name[bing.constantViolations[0].node.right.type];
                }
                else{
                    new_name = this.dec_scope + '_' +this.kind;
                }
            }

            while (true){
                count += 1;

                if (cache_array[this.parent_func.start][new_name]){
                    cache_array[this.parent_func.start][new_name] += 1;
                    new_name = new_name + cache_array[this.parent_func.start][new_name];
                }else{
                    cache_array[this.parent_func.start][new_name] = 1;
                    new_name = new_name + 1;
                }

                if (generator(this.parent_func).code.indexOf(new_name) !== -1){
                    continue
                }else{
                    break
                }

            }
        }

        scope.rename(name,new_name)
        // console.log(cache_array[this.parent_func.start])
        console.log(`变量重命名 ${name} -> ${new_name}`);

    }
}


const tra_func = {
    Identifier(path){
        if (path.node.name === this.old_name){
            path.node.name = this.new_name;
        }
    }
}


const AST_ = parse(code)

traverse(AST_, {
    VariableDeclaration(path) {

            // 判断这个变量是否在全局作用域
            let {scope,node} = path;
            let kind = node.kind;
            let dec_scope;

            if (scope.block.type === 'Program') {
                dec_scope = 'glb'
                path.traverse(dectet_node, {
                    kind,
                    dec_scope
                })
            }else {
                dec_scope = 'loc'
                let pp = path.getFunctionParent()
                if (pp){
                    let parent_func = pp.node
                    if (!cache_array[parent_func.start]){
                        cache_array[parent_func.start] = {}
                    }

                    path.traverse(dectet_node, {
                        kind,
                        dec_scope,
                        parent_func
                    })
                }

            }

    },
    CatchClause(path){
        let {scope} = path;
        let {param} = path.node;
        if (param){
            let new_name = 'error'+path.scope.generateUidIdentifier('msg').name;
            scope.rename(param.name,new_name)
        }
    },
    "FunctionDeclaration|FunctionExpression|ArrowFunctionExpression":{
        exit(path){
            let {scope} = path;
            let {id,params} = path.node;
            let count = 0;


            if (types.isIdentifier(id)){
                let old_name = id.name;
                if ((typeof detect_name !== 'number' && detect_name !== '' && old_name.indexOf(detect_name) !== -1) || (detect_name === old_name.length)){
                    let bing = scope.getBinding(old_name);
                    let new_name = 'fun'+path.scope.generateUidIdentifier('Dec').name;

                    scope.rename(old_name,new_name)
                    if (bing){
                        let p_path = path.getFunctionParent();
                        if (p_path){
                            p_path.traverse(tra_func,{
                                old_name : old_name,
                                new_name : new_name
                            })
                        }
                    }
                }
            }

            if (params.length > 0){
                var base_name;
                if (types.isFunctionExpression(path)){
                    base_name = 'Exp_arg';
                }
                else if(types.isFunctionDeclaration(path)){
                    base_name = 'Dec_arg';
                }
                else if(types.isArrowFunctionExpression(path)){
                    base_name = 'Arr_arg';
                }
                for (let i=0;i<params.length;i++){
                    let old_name;
                    let new_name;
                    if (types.isAssignmentPattern(params[i])){
                        old_name = params[i].left.name;
                    }
                    else if (types.isIdentifier(params[i])){
                        old_name = params[i].name;
                    }
                    else{
                        console.log('出现特殊形参 : ' + generator(params[i]).code)
                        continue
                    }
                    if ((typeof detect_name !== 'number' && detect_name !== '' && old_name.indexOf(detect_name) === -1) && (detect_name !== old_name.length)) continue

                    while (true){
                        count += 1
                        new_name = base_name + count;
                        if (generator(path.node).code.indexOf(new_name) === -1){
                            break
                        }
                    }
                    scope.rename(params[i].name,new_name)
                }
            }
        }
    }
});


let decode = generator(AST_, {minified: true, jsescOption: {minimal: true}}).code
decode = generator(parse(decode)).code // 再转一次 为了使代码格式化
console.log("初次解密完成!")
fs.writeFile("./result.js",decode,(err)=>{})
console.timeEnd('还原完毕-->耗时')