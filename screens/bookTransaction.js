import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, TextInput, Image} from 'react-native';
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
            "data": firebase.firestore.TimeStamp.now().toDate(),
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
            "data": firebase.firestore.TimeStamp.now().toDate(),
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
        var transactionMessage = null;
        db.collection("books").doc(this.state.scannedBookId).get().then((doc)=> {
            var book = doc.data();
            if(book.bookAvailability) {
                this.initiateBookIssue();
                transactionMessage = "bookIssue";
            }
            else{
                this.initiateBookReturn();
                transactionMessage = "bookReturn";
            }
        })
        this.setState({transactionMessage: transactionMessage});
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
                <View style= {styles.container}>
                    <View>
                        <Image source= {require("../assets/booklogo.jpg")} style= {{width: 200, height: 200}}></Image>
                        <Text style= {{textAlign: 'center', fontSize: 30}}>Library Helper </Text>
                    </View>
                    <View style= {styles.inputView}>
                        <TextInput style= {styles.inputBox} placeholder= "book id" value= {this.state.scannedBookId}>
                        </TextInput>
                        <TouchableOpacity style= {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("bookId")}
                            }>
                            <Text style= {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <View style= {styles.inputView}>
                        <TextInput style= {styles.inputBox} placeholder= "student id" value= {this.state.scannedStudentId}>
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
                        <Text style= {submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
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
