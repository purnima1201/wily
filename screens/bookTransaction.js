import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Alert, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../Config';

export default class BookTransaction extends React.Component {
    constructor(){
        super();
        this.state = {
            hasCameraPermission: null,
            scanned: false,
            scannedBookId: '',
            buttonState: 'normal',
            scannedStudentId: '',
            transactionMessage: ''            
        }
    }

    getCameraPermissions = async(id)=> {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status == 'granted',
            buttonState: id,
            scanned: false
        })
    }

    handleBarCodeScanned = async ({ type, data }) => {
        const buttonState = this.state.buttonState;
        if(buttonState == "bookId"){
            this.setState({ scanned: true, scannedBookId: data, buttonState: 'normal'});
        }
        else if(buttonState == 'studentId'){
            this.setState({ scanned: true, scannedStudentId: data, buttonState: 'normal'});
        }
    };

    initiateBookIssue = async ()=> {
        db.collection("transaction").add({
            "studentId": this.state.scannedStudentId,
            "bookId": this.state.scannedBookId,
            "data": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            "bookAvailability": false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued": firebase.firestore.FieldValue.increment(1)
        })
        this.setState({scannedStudentId: '', scannedBookId: ''})
    }

    initiateBookReturn = async ()=> {
        db.collection("transaction").add({
            "studentId": this.state.scannedStudentId,
            "bookId": this.state.scannedBookId,
            "data": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            "bookAvailability": true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued": firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({scannedStudentId: '', scannedBookId: ''})
    }

    handleTransaction = async ()=> {
        var transactionType = await this.checkBookEligibility();
        var transactionMessage = null;
        if(!transactionType){
            Alert.alert("This book does not exist in our database");
            this.setState({scannedStudentId: '', scannedBookId: ''})
        }
        else if(transactionType == "issue"){
            var isStudentEligible = await this.stdEliBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                transactionMessage = "bookIssue";
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
                Alert.alert(transactionType);
            }          
        }
        else if (transactionType == "return"){
            var isStudentEligible = await this.stdEliBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                transactionMessage = "bookReturn";
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
                Alert.alert(transactionType);
            }
        }       
        this.setState({transactionMessage: transactionMessage});
    }

    checkBookEligibility = async()=>{
        const bookRef = db.collection("books").where("bookId", "==", this.state.scannedBookId).get();
        var transactionType = '';
        console.log(bookRef.docs);
        if(bookRef.docs.length == 0){
            transactionType = false;
        }
        else{
            bookRef.docs.map((data)=>{
                var book = data.data();
                if(book.bookAvailability){
                    transactionType = 'issue';
                }
                else{
                    transactionType = 'return';
                }
            })
        }
        return transactionType;  
    }

    stdEliBookIssue = async()=>{
        const studentRef = db.collection("students").where("studentId", "==", this.state.scannedStudentId).get();
        var isStudentEligible = '';
        if(studentRef.docs.length == 0){
            isStudentEligible = false;
            this.setState({scannedStudentId: '', scannedBookId: ''});
            Alert.alert("The student ID does not exist in the database");
        }
        else{
            studentRef.docs.map((data)=>{
                var student = data.data();
                if(student.numberOfBooksIssued < 2){
                    isStudentEligible = true;
                }
                else{
                    isStudentEligible = false;
                    Alert.alert("The student has already issued 2 books");
                    this.setState({scannedStudentId: '', scannedBookId: ''});
                }
            })
        }
        return isStudentEligible;  
    }

    stdEliBookReturn = async()=>{
        const transactionRef = db.collection("transaction").where("bookId", "==", this.state.scannedBookId).limit(1).get();
        var isStudentEligible = '';
        transactionRef.docs.map((doc)=>{
            var latestTransaction = doc.data();
            if(latestTransaction.studentId == this.state.scannedStudentId){
                isStudentEligible = true;
            }
            else{
                isStudentEligible = false;
                Alert.alert("The book was not issued by this student");
                this.setState({scannedStudentId: '', scannedBookId: ''});
            }
        })
        return isStudentEligible;
    }

    render(){
        const hasCameraPermission = this.state.hasCameraPermission;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState != 'normal' && hasCameraPermission) {
            return(
                <BarCodeScanner onBarCodeScanned = {scanned? undefined: this.handleBarCodeScanned}
                style= {StyleSheet.absoluteFillObject}>
                </BarCodeScanner>
            )
        }
        else if(buttonState == 'normal'){
            return (
                <KeyboardAvoidingView style= {styles.container} behaviour= "padding" enabled>
                    <View>
                        <Image source= {require("../assets/booklogo.jpg")} style= {{width: 200, height: 200}}></Image>
                        <Text style= {{textAlign: 'center', fontSize: 30}}>Library Helper </Text>
                    </View>
                    <View style= {styles.inputView}>
                        <TextInput style= {styles.inputBox} placeholder= "book id" value= {this.state.scannedBookId}
                        onChangeText= {(text)=> this.setState({scannedBookId: text})}>
                        </TextInput>
                        <TouchableOpacity style= {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("bookId")}
                            }>
                            <Text style= {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <View style= {styles.inputView}>
                        <TextInput style= {styles.inputBox} placeholder= "student id" value= {this.state.scannedStudentId}
                        onChangeText= {(text)=> this.setState({scannedStudentId: text})}>
                        </TextInput>
                        <TouchableOpacity style= {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("studentId")}
                            }>
                            <Text style= {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style= {styles.submitButton} onPress= {async()=>{
                        var transactionMessage = await this.handleTransaction();
                    }}>
                        <Text style= {styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )
        }       
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor: '#FBC02D',
        width: 100,
        height:50
      },
      submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight:"bold",
        color: 'white'
      }
  });
