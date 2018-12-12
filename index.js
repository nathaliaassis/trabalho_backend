//aqui é feita a definição dos módulos
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//configuração das requisições para usar o json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//método de conexão do Mongo.Client
const MongoClient = require('mongodb').MongoClient;
// caminho para o Banco de Dados
const uri = "mongodb://root:root1234@ds129484.mlab.com:29484/dbtasks";
const newParser = { useNewUrlParser: true };

// nesse trecho de código ele define que o servidor só irá rodar se o banco de dados estiver funcionando
MongoClient.connect(uri, newParser, (err, client)=>{
    if(err) return console.log(err);
    db = client.db('dbtasks');

    //aqui é definida a porta na qual o servidor irá rodar
    app.listen(3000, () => 
        console.log('Server Started on port 3000!')
    );
});
//trecho de código para configurar a view engine no express
app.set('view engine', 'ejs'); 

//Array vazio tasks
const tasks= [];

//solicitação get ao servidor para executar uma operação de leitura
app.get('/', (req, res) =>{
    
    //código para setar arquivo para enviá-lo ao servidor e redenrizá-lo  no navegador
    res.render('index.ejs');
});


// obtendo o conteúdo do BD usando o método find disponível no método collection
app.get('/', (req, res) => {
//O método de localização retorna um cursor(um objeto do Mongo), este objeto contém todas as citações do banco de dados.    
    var cursor = db.collection('data').find();
})

//renderiza na tabela todas as tarefas salvas no banco de dados. 
app.get('/tasks', (req, res) => {
    //O método toArray recebe uma função callback que permite fazer algumas coisas com os objetos recuperados do mLab. 
    db.collection('data').find().toArray((err, results) => {
        if (err) return console.log(err)
        res.render('tasks.ejs', { data: results })
    })
})

//processa a solicitação post do form 
app.post('/tasks', (req, res)=>{
    
    const {body} = req;
    //criando tarefas no servidor
    const task = {    
        id: Math.random().toString().replace('0.', ''), //gera um numero randomico para o id
        title: body.title,
        resume: body.resume,
        isDone: body.isDone,
        isPriority: body.isPriority
    };
    //inserindo tarefa no banco de dados
    db.collection('data').insertOne(req.body, (err, result)=>{
        
        if(err) return console.log(err);

        console.log('salvo no banco de dados');
        //redirecionará para a página /tasks
        res.redirect('tasks');
    });

    tasks.push(task);
    res.status(201);
});

app.route('/edit/:id')
.get((req, res)=>{
    //requerimento do objeto no banco de dados.
    var ObjectId = require('mongodb').ObjectID;
    //id que irá passar no params para encontrar o objeto a ser altero no banco de dados
    var id = req.params.id
    // trecho de código para percorrer o array até encontrar o objeto selecionado 
    db.collection('data').find(ObjectId(id)).toArray((err, result)=>{
        if(err) return res.send(err)
        //irá renderizar a view para editar o objeto selecionado
        res.render('edit.ejs', {data: result})
    })
})

//o trecho a seguir irá inserir as informações editadas 
.post((req, res)=>{

    var id = req.params.id
    var title = req.body.title
    var resume = req.body.resume
    var isDone = req.body.isDone
    var isPriority = req.body.isPriority

    var ObjectId = require('mongodb').ObjectID;
    //o updateOne recebe o objeto que é alterado
    db.collection('data').updateOne({_id:ObjectId(id)}, {
        //$set recebe os dados que serão atualizados
        $set: {
            title: title,
            resume: resume,
            isDone: isDone,
            isPriority: isPriority
        }
    }, (err, result)=>{
        if(err) return res.send(err)
        //se tudo der certo, será redirecionado para a tela da tabela com todas as tasks, inclusive a que foi alterada
        res.redirect('/tasks')

        console.log('Task atualizada no Banco de Dados!');
    })
})
//o trecho de codigo a seguir será para deletar a task 
app.route('/delete/:id')
.get((req, res)=>{
    var ObjectId = require('mongodb').ObjectID;
    var id = req.params.id
    // irá deletar apenas o objeto  selecionado 
    db.collection('data').deleteOne({_id: ObjectId(id)}, (err, result)=>{
        if(err) return res.send(500, err)
        console.log("Task deletada do Banco de Dados!")
    //redirecionará para a página da tabela de tasks     
        res.redirect('/tasks');
    })
})
