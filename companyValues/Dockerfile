FROM public.ecr.aws/lambda/nodejs:18

# # Workaround for Apple M processors (may not be needed for other processors)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV DEBIAN_FRONTEND=noninteractive



# # Install necessary packages
RUN yum update -y && \
    yum install -y \
    curl \
    git \
    gnupg \
    gcc \
    gcc-c++ \
    make \
    openssl-devel \
    zlib-devel \
    libcurl-devel \
    python3 \
    wget \
    dumb-init \
    cmake3 \
    autoconf \
    automake \
    libtool \
    && yum clean all && \
    rm -rf /var/cache/yum


RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

RUN yum install ./google-chrome-stable_current_x86_64.rpm -y

RUN ln -s /usr/bin/google-chrome-stable /usr/bin/chromium


# Install a newer version of CMake
# RUN curl -L https://github.com/Kitware/CMake/releases/download/v3.21.0/cmake-3.21.0-linux-x86_64.sh -o cmake.sh && \
#     chmod +x cmake.sh && \
#     ./cmake.sh --skip-license --prefix=/usr/local && \
#     rm cmake.sh



# Set the working directory
# WORKDIR  /function

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of your application's code
COPY . ${LAMBDA_TASK_ROOT}

# Build your application if necessary
RUN npm run build

# COPY lambda-entrypoint.sh 
# RUN chmod +x /lambda-entrypoint.sh

# ENTRYPOINT ["/var/lang/bin/npx", "aws-lambda-ric"]

# Set the CMD to your handler
CMD ["dist/handler.handler"]