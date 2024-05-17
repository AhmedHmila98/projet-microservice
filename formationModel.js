const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const formationModel = new Schema ({
    nom : {
        type : String,         
        required : true
    },

    description : {
        type : String,
        required : true
    },

    prix : {
        type : String,
        required : true,
        
    },
    
    duree:{
        type : String,
        required: true,
        trim: true
    }
   
},


)




module.exports = mongoose.model('Formation', formationModel);