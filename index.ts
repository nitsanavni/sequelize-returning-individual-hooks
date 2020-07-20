import test from "ava";
import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize";

test("`model.update` combining `returning` and `individualHooks`", async (t) => {
    const sequelize = new Sequelize({ dialect: "sqlite" });

    const Ghost: ModelCtor<Model<{ id?: number; name: string }>> = sequelize.define("Ghost", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
        name: { type: DataTypes.STRING },
    });

    await sequelize.sync();

    const past = (await Ghost.create({ name: "Past" })).toJSON() as { id: number };

    t.is(past.id, 1);

    const [futureCount, futureInstances] = await Ghost.update({ name: "Future" }, { where: { id: past.id } });

    t.is(futureCount, 1);
    t.is(futureInstances, undefined);

    // the following line causes an error:
    // TypeError { message: 'instances.map is not a function' }
    // › Function.update (node_modules/sequelize/lib/model.js:3173:35)
    const [presentCount, presentInstances] = await Ghost.update(
        { name: "Present" },
        { where: { id: past.id }, returning: true, individualHooks: true }
    );

    t.is(presentCount, 1);
    t.is(presentInstances[0].getDataValue("name"), "Present");
});
