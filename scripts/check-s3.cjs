const {load,root}=require('./lib/load-typescript.cjs');
const {HeadBucketCommand}=require('@aws-sdk/client-s3');
require('@next/env').loadEnvConfig(root,true,{info(){},error(){}});
(async()=>{
const {createS3Client}=load('src/modules/media/repositories/s3-images.ts');
const {s3Config}=load('src/modules/media/services/s3-config.ts');
const client=createS3Client();
try{await client.send(new HeadBucketCommand({Bucket:s3Config().bucket}),{abortSignal:AbortSignal.timeout(15000)});console.log('Conexão S3 e bucket de imagens validados. Nenhum upload realizado.');}finally{client.destroy()}
})().catch(()=>{console.error('Não foi possível validar o S3. Confira endpoint, região, bucket e credenciais do servidor.');process.exitCode=1});
