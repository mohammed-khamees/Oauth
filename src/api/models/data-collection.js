'use strict';

// THIS IS THE STRETCH GOAL ...
// It takes in a schema in the constructor and uses that instead of every collection
// being the same and requiring their own schema. That's not very DRY!

class DataCollection {
	constructor(model) {
		this.model = model;
	}

	get(_id) {
		try {
			if (_id) {
				return this.model.findOne({ _id });
			} else {
				return this.model.find({});
			}
		} catch (error) {
			return new Error(error.message);
		}
	}

	create(record) {
		try {
			let newRecord = new this.model(record);
			return newRecord.save();
		} catch (error) {
			return new Error(error.message);
		}
	}

	update(_id, record) {
		try {
			return this.model.findByIdAndUpdate(_id, record, { new: true });
		} catch (error) {
			return new Error(error.message);
		}
	}

	delete(_id) {
		try {
			return this.model.findByIdAndDelete(_id);
		} catch (error) {
			return new Error(error.message);
		}
	}
}

module.exports = DataCollection;
