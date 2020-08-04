var express = require('express');
const router = express.Router();


router.get('/:schno', async (req, res) =>  {   
    var sql = require("mssql");    
// config for your database
    var config = {
        user: 'vmouexam',
        password: 'VM0u_3x@mjPE',
        server: '172.16.0.16', 
        database: 'vmouexam'
    };

    // connect to your database
    sql.connect(config, function (err) {
        if (err) {   
            console.log("Error while connecting database :- " + err);
            res.send(err);
        }
        else {   
                // create Request object
            var request = new sql.Request();
                // query to the database and get the records
            const cs = "SELECT result.pcode,result.ptype,student.rcentre,result.schno,sname,fname,mname,result.ccode,result.omarks,courseresult,studentprogram.overallresult as overallresult,exam as remarks,rstatus,result.result FROM student, studentprogram,result where student.schno=studentprogram.schno and student.schno=result.schno and studentprogram.pcode=result.pcode and result.schno='" + req.params.schno + "' order by rcentre,schno,pcode,ccode,ptype, trno"
                //const cs = "SELECT result.pcode,result.ptype,student.rcentre,result.schno,sname,fname,mname,result.ccode,result.omarks,courseresult,studentprogram.overallresult as overallresult,exam as remarks,rstatus,result.result FROM student, studentprogram,result where result.pcode='" & cboProg.Text & "' and student.schno=studentprogram.schno and student.schno=result.schno and studentprogram.pcode=result.pcode and result.schno='" & schno & "' order by rcentre,schno,pcode,ccode,ptype, trno"
                //const cs = "select pcode from studentprogram where schno='" + req.params.schno + "' order by yrsem"
            const detail = [{
                pcode:'',
                ccode:'',
                ptype:'',
                marks:0,
                rstatus:'',
                result:'',
                overall:''
            }];
            request.query(cs, function (err, recordset) {      
                if (err) {
                    console.log("Error while querying database :- " + err);
                    res.send(err);
                }
                else {
                    recordset.forEach(element => {
                        
                    });
                    res.send(recordset);
                }        
            });
        }
    });
});

module.exports = router; 
