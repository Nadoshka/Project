import React from 'react';
import PropTypes from 'prop-types';
//to interact a component with redux whether calling in action or getting the state we use connect from react-redux.
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    //alert-${alert.alertType show up as alert-danger which has the styling attached to it.
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

//mapping the redux state to a prop in this component so that we have access to it in this case it will be the array of alerts.
const mapStateToProps = state => ({
  alerts: state.alert, // => alert is a reducer that we have it in rootReducer which is index (reducers/index.js)
  //to get the state inside of alert we say state.alert
});

export default connect(mapStateToProps)(Alert);
