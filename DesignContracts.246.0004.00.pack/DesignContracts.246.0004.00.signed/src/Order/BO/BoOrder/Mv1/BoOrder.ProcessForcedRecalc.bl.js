"use strict";

///////////////////////////////////////////////////////////////////////////////////////////////
//                 IMPORTANT - DO NOT MODIFY AUTO-GENERATED CODE OR COMMENTS                 //
//Parts of this file are auto-generated and modifications to those sections will be          //
//overwritten. You are allowed to modify:                                                    //
// - the tags in the jsDoc as described in the corresponding section                         //
// - the function name and its parameters                                                    //
// - the function body between the insertion ranges                                          //
//         "Add your customizing javaScript code below / above"                              //
//                                                                                           //
// NOTE:                                                                                     //
// - If you have created PRE and POST functions, they will be executed in the same order     //
//   as before.                                                                              //
// - If you have created a REPLACE to override core function, only the REPLACE function will //
//   be executed. PRE and POST functions will be executed in the same order as before.       //
//                                                                                           //
// - For new customizations, you can directly modify this file. There is no need to use the  //
//   PRE, POST, and REPLACE functions.                                                       //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Use the following jsDoc tags to describe the BL function. Setting these tags will
 * change the runtime behavior in the mobile app. The values specified in the tags determine
 * the name of the contract file. The filename format is “@this . @function .bl.js”.
 * For example, LoVisit.BeforeLoadAsync.bl.js
 * -> function: Name of the businessLogic function.
 * -> this: The LO, BO, or LU object that this function belongs to (and it is part of the filename).
 * -> kind: Type of object this function belongs to. Most common value is "businessobject".
 * -> async: If declared as async then the function should return a promise.
 * -> param: List of parameters the function accepts. Make sure the parameters match the function signature.
 * -> module: Use CORE or CUSTOM. If you are a Salesforce client or an implementation partner, always use CUSTOM to enable a seamless release upgrade.
 * -> extends: Base class of the LO, BO, and LU objects that this function belongs to.
 * -> maxRuntime: Maximum time this function is allowed to run, takes integer value in ms. If the max time is exceeded, error is logged.
 * -> returns: Type and variable name in which the return value is stored.
 * @function processForcedRecalc
 * @this BoOrder
 * @kind TODO_ADD_BUSINESS_OBJECT_TYPE
 * @async
 * @namespace CORE
 * @returns promise
 */
function processForcedRecalc(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var promise = when.resolve("ok");

//Get StateType of next phase
var nextStates = me.getBoWorkflow().getNextStates(me.getActualStatePKey());

if (nextStates.length > 0){
  if (nextStates[0].stateType == "Released"){
    //check whether to check for forced recalculation
    var boMeta = me.getBoOrderMeta();
    var recalcRequired = boMeta.getRecalculationRequired();
    if(recalcRequired !== "No"){
      var computePrice = (boMeta.getComputePrice() === BLConstants.Order.BUTTON_MODE) || (boMeta.getComputePrice() === BLConstants.Order.EDIT_MODE);
      /*The system checks whether the order is outdated. The order is outdated if
        Order.Calculation_Time <> empty (Min.Date)
        Order.Calculation_Time <> current date (only date, time not considered)
        get date part of calc time*/
      var calcTime = Utils.convertAnsiDateTime2AnsiDate(me.getCalculationTime());
      var doctatype = me.getDocTaType();
      var outdated = calcTime !== Utils.getMinDateAnsi() && calcTime !== Utils.createAnsiDateToday() && doctatype !== "NonValuatedDeliveryNote";
      var forceRecalc = computePrice && outdated;

      if(forceRecalc){
        if(recalcRequired === "YesNotify"){
          //show the notification
          var buttonValues = {};
          buttonValues[Localization.resolve("OK")] = "ok";
          buttonValues[Localization.resolve("Cancel")] = "cancel";
          promise = MessageBox.displayMessage(Localization.resolve("MessageBox_Title_Notification"), Localization.resolve("OrderForcedRecalculation"), buttonValues).then(
            function(input){
              if(input === "ok"){
                return me.cpCalculate().then(
                  function(){
                    return "ok";
                  });
              }
              else{
                //cancel release process
                me.setSetPhaseInBeforeSave("0");
                me.setValidateForRelease("0");
                return "Cancel";
              }
            });
        }
        else{
          promise = me.cpCalculate().then(
            function(){
              return "ok";
            });
        }
      }
    }
  }
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}