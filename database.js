
exports.insertRow =  function(Collection, data, callback) {
  const newrow = new Collection(data);
  newrow.save(function(err, addeddata) {
    if(err) {
      console.log(err);
    }
    else {
      callback(addeddata);
    }
  });
}

exports.findAllRows = function(Collection, callback) {
  Collection.find(function(err, rows) {
    if(err) {
      console.log(err);
    }
    else {
      callback(rows);
    }
  });
}

exports.findAndSortRows = function(Collection, sortObj ,callback) {
  Collection.find().sort(sortObj).exec(function(err, rows) {
    if(err) {
      console.log(err);
    }
    else {
      callback(rows);
    }
  });
}

exports.findRow = function(Collection, condition, callback) {
  Collection.findOne(condition, function(err, row) {
    if(err) {
      console.log(err);
    }
    else {
      callback(row);
    }
  });
}

exports.updateRow = function(Collection, condition, updatedata, callback) {
  Collection.updateOne(condition, updatedata, function(err, updateddata) {
    if(err) {
      console.log(err);
    }
    else {
      callback(updateddata);
    }
  });
}

exports.findAndUpdateRow = function(Collection, condition, updatedata, callback) {
  Collection.findOneAndUpdate(condition, updatedata, {new: true}, function(err, newdata) {
    if(err) {
      console.log(err);
    }
    else {
      callback(newdata);
    }
  })
}

exports.deleteRow = function(Collection, condition, callback) {
  Collection.deleteOne(condition, function(err, deleteddata){
    if(err) {
      console.log(err);
    }
    else {
      callback(deleteddata);
    }
  });
}
