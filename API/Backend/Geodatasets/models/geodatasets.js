/***********************************************************
 * Loading all required dependencies, libraries and packages
 **********************************************************/
const Sequelize = require("sequelize");
const { sequelize } = require("../../../connection");
const logger = require("../../../logger");

const attributes = {
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  table: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
};

const options = {
  timestamps: true,
};

// setup User model and its fields.
var Geodatasets = sequelize.define("geodatasets", attributes, options);

function makeNewGeodatasetTable(name, success, failure) {
  name = name.replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");

  const attributes = {
    properties: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {},
    },
    start_time: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    end_time: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    geometry_type: {
      type: Sequelize.STRING,
      unique: false,
      allowNull: false,
    },
    geom: {
      type: Sequelize.GEOMETRY,
      allowNull: true,
    },
  };

  const options = {
    timestamps: false,
  };

  Geodatasets.findOne({ where: { name: name } })
    .then((result) => {
      if (result) {
        let GeodatasetTable = sequelize.define(
          result.dataValues.table,
          attributes,
          options
        );
        Geodatasets.update(
          { updatedAt: new Date().toISOString() },
          { where: { name: name }, silent: true }
        )
          .then((r) => {
            sequelize
              .query(
                `CREATE INDEX IF NOT EXISTS ${result.dataValues.table}_geom_idx on ${result.dataValues.table} USING gist (geom);`
              )
              .then(() => {
                sequelize
                  .query(
                    `CREATE INDEX IF NOT EXISTS ${result.dataValues.table}_time_idx on ${result.dataValues.table} USING gist (start_time, end_time);`
                  )
                  .then(() => {
                    success({
                      name: result.dataValues.name,
                      table: result.dataValues.table,
                      tableObj: GeodatasetTable,
                    });

                    return null;
                  })
                  .catch((err) => {
                    logger(
                      "error",
                      "Failed to recreate temporal index for geodataset table.",
                      "geodatasets",
                      null,
                      err
                    );
                    failure({
                      status: "failure",
                      message: "Failed to recreate temporal index",
                    });
                  });
              })
              .catch((err) => {
                logger(
                  "error",
                  "Failed to recreate spatial index for geodataset table.",
                  "geodatasets",
                  null,
                  err
                );
                failure({
                  status: "failure",
                  message: "Failed to recreate spatial index",
                });
              });
          })
          .catch((err) => {
            logger(
              "error",
              "Failed to update geodatasets.",
              "geodatasets",
              null,
              err
            );
            failure({
              status: "failure",
              message: "Failed to update geodatasets",
            });
          });
      } else {
        sequelize
          .query("SELECT COUNT(*) FROM geodatasets")
          .then(([results]) => {
            let newTable =
              "g" + (parseInt(results[0].count) + 1) + "_geodatasets";

            Geodatasets.create({
              name: name,
              table: newTable,
            })
              .then((created) => {
                let GeodatasetTable = sequelize.define(
                  newTable,
                  attributes,
                  options
                );
                sequelize
                  .sync()
                  .then(() => {
                    sequelize
                      .query(
                        `CREATE INDEX ${newTable}_geom_idx on ${newTable} USING gist (geom);`
                      )
                      .then(() => {
                        sequelize
                          .query(
                            `CREATE INDEX ${newTable}_time_idx on ${newTable} USING gist (start_time, end_time);`
                          )
                          .then(() => {
                            success({
                              name: name,
                              table: newTable,
                              tableObj: GeodatasetTable,
                            });
                            return null;
                          })
                          .catch((err) => {
                            logger(
                              "error",
                              "Failed to create temporal index for geodataset table.",
                              "geodatasets",
                              null,
                              err
                            );
                            failure({
                              status: "failure",
                              message: "Failed to create temporal index",
                            });
                          });
                      })
                      .catch((err) => {
                        logger(
                          "error",
                          "Failed to create spatial index for geodataset table.",
                          "geodatasets",
                          null,
                          err
                        );
                        failure({
                          status: "failure",
                          message: "Failed to create spatial index",
                        });
                      });
                  })
                  .catch((err) => {
                    logger(
                      "error",
                      "Failed to sync geodataset table.",
                      "geodatasets",
                      null,
                      err
                    );
                    failure({
                      status: "failure",
                      message: "Failed to sync",
                    });
                  });

                return null;
              })
              .catch((err) => {
                logger(
                  "error",
                  "Failed to create geodataset table.",
                  "geodatasets",
                  null,
                  err
                );
                failure({
                  status: "failure",
                  message: "Failed to create",
                });
              });
            return null;
          })
          .catch((err) => {
            logger(
              "error",
              "Failed to count existing geodatasets.",
              "geodatasets",
              null,
              err
            );
            failure({
              status: "failure",
              message: "Failed to count existing geodatasets",
            });
          });
      }

      return null;
    })
    .catch((err) => {
      logger(
        "error",
        "Failed to find existing geodatasets.",
        "geodatasets",
        null,
        err
      );
      failure({
        status: "failure",
        message: "Failed to find existing geodatasets",
        error: err,
        name: name,
      });
    });
}

// export User model for use in other files.
module.exports = {
  Geodatasets: Geodatasets,
  makeNewGeodatasetTable: makeNewGeodatasetTable,
};
