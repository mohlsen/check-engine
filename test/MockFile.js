const path = require('path');
const fs = require('fs');

function MockFile(filePath, fileContents) {
    this.path = path.join(process.cwd(), filePath);
    this.contents = fileContents;

    try {
        fs.writeFileSync(this.path, JSON.stringify(this.contents));
        this.status = 0;
        return this;
    }
    catch (ex) {
        this.status = -1;
        this.error = ex;
        return this;
    }
}

MockFile.prototype.delete = function() {
    try {
        fs.unlinkSync(this.path);
        this.deleted = true;
        return { status: 0 };
    }
    catch (ex) {
        return { status: -1, error: ex };
    }
};

module.exports = MockFile;
