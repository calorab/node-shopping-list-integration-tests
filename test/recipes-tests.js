const chai = require("chai");
const chaiHttp = require("chai-http"); //chai browser

const {
    app,
    runServer,
    closeServer
} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);
//suite of tests
describe('Recipes', function () {
    //there is also a beforeEach/afterEach
    //use to add recipes to test
    before(function () {
        return runServer();
    });

    after(function () {
        return closeServer();
    });
    //test cases - be specific in title in case a lot of tests. Expect simpler than should but fast less complex
    it('should list items on GET', function () {
        return chai
            .request(app)
            .get('/recipes')
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a("array");
                expect(res.body.length).to.be.at.least(1);
                const expectedKeys = ["id", "name", "ingredients"];
                res.body.forEach(function (item) {
                    expect(item).to.be.a("object");
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    it('should add an item on POST', function () {
        const newItem = {
            name: "coffee",
            ingredients: ["water", "coffee grounds"]
        };
        return chai
            .request(app)
            .post("/recipes")
            .send(newItem)
            .then(function (res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a("object");
                expect(res.body).to.include.keys("id", "name", "ingredients");
                expect(res.body).to.deep.equal(
                    Object.assign(newItem, { //all this wrong I think
                        id: res.body.id
                    })
                );
            });
    });
    it('should update item on PUT', function () {
        const updateData = {
            name: "foo",
            Ingredients: ["bizz", "bang"]
        };
        return (chai
            .request(app)
            .get('/recipes')
            .then(function (res) {
                console.log(res.body);
                updateData.id = res.body[0].id;

                return chai
                    .request(app)
                    .put(`/shopping-list/${updateData.id}`)
                    .send(updateData)
            })

            .then(function (res) {
                expect(res).to.have.status(400);
                expect(res).to.be.json; //these
                expect(res.body).to.be.a("object"); //aren't included
                expect(res.body).to.deep.equal(updateData); // in the answer
            })
        );
    });

    it("should delete items on DELETE", function () {
        return (
            chai
            .request(app)
            .get("/recipes")
            .then(function (res) {
                return chai.request(app).delete(`/recipes/${res.body[0].id}`);
            })
            .then(function (res) {
                expect(res).to.have.status(204);
            })
        );
    });
});
