const mongoose = require('mongoose');

const Schema=mongoose.Schema

const bcrypt = require("bcrypt");

const etudiantModel = new Schema ({
    nom : {
        type : String,         
        required : true
    },

    prenom : {
        type : String,
        required : true
    },

    login : {
        type : String,
        required : true,
        validate: {

            validator: function (v) {
       
            return (/\S+@\S+\.\S+/.test(v));
    
            },
    
            message: props => `${props.value} is not a valid email format!`
    
            }
    },
    
    password:{
        type : String,
        required: true,
        trim: true
    },
    
    cin:{
        type : String,
        //required : true
        
    },

   
},



)

etudiantModel.pre('save',function(next){
    this.password=bcrypt.hash(this.password,10);
    next();
});


module.exports = mongoose.model('Etudiant', etudiantModel);