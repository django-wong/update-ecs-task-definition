import * as core from "@actions/core";
import { ECS } from "aws-sdk";

const R_T = {required: true, trimWhitespace: true};
const O_T = {required: false, trimWhitespace: true};

async function _run() {
    // Required inputs
    const family = core.getInput('task-definition-family', R_T);
    const image = core.getInput('image', R_T);

    // Optional inputs
    const cluster = core.getInput('cluster', O_T);
    const containerName = core.getInput('container', O_T);
    const service = core.getInput('service', O_T);
    const forceNewDeployment = core.getBooleanInput('force-new-deployment', O_T);

    const ecs = new ECS();
    const res = await ecs.describeTaskDefinition({taskDefinition: family}).promise();

    const task = res.taskDefinition;
    
    if (!task) {
        throw new Error('Task definition not found');
    }

    res.taskDefinition?.containerDefinitions?.forEach((container) => {
        if ((containerName && (container.name ?? "").match(new RegExp(containerName))) || !containerName) {
            container.image = image;
        }
    });

    const updated = await ecs.registerTaskDefinition({
        family: family,
        containerDefinitions: task.containerDefinitions ?? [],
        taskRoleArn: task.taskRoleArn,
        executionRoleArn: task.executionRoleArn,
        networkMode: task.networkMode,
        volumes: task.volumes,
        placementConstraints: task.placementConstraints,
        requiresCompatibilities: task.requiresCompatibilities,
        cpu: task.cpu,
        memory: task.memory
    }).promise();


    if (!updated.taskDefinition?.family) {
        throw new Error('Can not update task definition');
    }

    core.setOutput('revision', updated.taskDefinition.revision);

    if (!service) {
        return;
    }

    await ecs.updateService({
        cluster,
        service,
        forceNewDeployment: forceNewDeployment,
        taskDefinition: `${updated.taskDefinition?.family}:${updated.taskDefinition?.revision}`,
    }).promise()
}

_run();
